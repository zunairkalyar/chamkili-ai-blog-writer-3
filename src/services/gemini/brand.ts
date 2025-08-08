
import { Type } from "@google/genai";
import { ai } from "./client";
import { CustomerPersona } from "./types";

export async function analyzeBrandVoice(text: string): Promise<string> {
    const prompt = `Analyze the following text and describe its brand voice in one paragraph for an AI.
Text: ${text.substring(0, 4000)}`;
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return response.text;
}

export async function analyzeBrandVoiceFromUrl(url: string): Promise<string> {
    const prompt = `Analyze the content at ${url} and describe its brand voice in one paragraph for an AI.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text;
}

export async function generateCustomerPersona(description: string): Promise<CustomerPersona> {
    const prompt = `Create a detailed customer persona based on this description: "${description}".
Return JSON with name, age, occupation, location, skincareGoals, painPoints, motivations, personality, bio.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    age: { type: Type.INTEGER },
                    occupation: { type: Type.STRING },
                    location: { type: Type.STRING },
                    skincareGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
                    painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                    motivations: { type: Type.ARRAY, items: { type: Type.STRING } },
                    personality: { type: Type.STRING },
                    bio: { type: Type.STRING }
                },
                required: ['name', 'age', 'occupation', 'location', 'skincareGoals', 'painPoints', 'motivations', 'personality', 'bio']
            }
        }
    });
    return JSON.parse(response.text) as CustomerPersona;
}
