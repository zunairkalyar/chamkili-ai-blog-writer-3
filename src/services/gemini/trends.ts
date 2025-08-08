
import { Type } from "@google/genai";
import { ai } from "./client";
import { TrendingTopic, TrendingTopicResult, TrendingTopicSource } from "./types";

export async function getTrendingTopics(): Promise<TrendingTopicResult> {
    const prompt = `Identify top 5 trending skincare topics in Pakistan. For each, provide the topic and reason.
Return JSON with {trends: [{topic, reason}]}.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    trends: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                topic: { type: Type.STRING },
                                reason: { type: Type.STRING }
                            },
                            required: ["topic", "reason"]
                        }
                    }
                },
                required: ["trends"]
            }
        }
    });

    const parsed = JSON.parse(response.text) as { trends: TrendingTopic[] };
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map(chunk => chunk.web)
        .filter((web): web is TrendingTopicSource => !!web) || [];

    return { topics: parsed.trends, sources: sources };
}
