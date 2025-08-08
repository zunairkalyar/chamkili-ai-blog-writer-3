import { Type } from "@google/genai";
import { ai } from "./client";
import { TrendingTopic, TrendingTopicResult, TrendingTopicSource } from "./types";

export async function getTrendingTopics(): Promise<TrendingTopicResult> {
    const prompt = `
You are a market research analyst specializing in the beauty industry.
Using Google Search, identify the top 5 trending skincare topics, ingredients, or concerns for women in Pakistan right now.
For each trend, provide a concise reason why it's trending (e.g., "viral on TikTok", "seasonal demand").

Return the response in the specified JSON format.
`;

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
                                topic: { type: Type.STRING, description: "The trending topic or ingredient." },
                                reason: { type: Type.STRING, description: "A brief explanation of why it's trending." }
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
        .filter((web): web is TrendingTopicSource => web !== undefined) || [];

    return {
        topics: parsed.trends,
        sources: sources
    };
}
