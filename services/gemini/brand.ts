import { Type } from "@google/genai";
import { ai } from "./client";
import { CustomerPersona } from "./types";

export async function analyzeBrandVoice(text: string): Promise<string> {
    const prompt = `Analyze the tone, style, vocabulary, and sentence structure of the following text, which represents a brand's voice.
Based on your analysis, write a short, one-paragraph description of this brand voice. This description will be used as a system instruction for an AI to generate future content that matches this voice.
The description should be clear, concise, and actionable for an AI. For example: "The brand voice is warm, knowledgeable, and slightly scientific. It uses clear, accessible language but isn't afraid to reference key ingredients. Sentences are generally short and direct. The tone is empowering and reassuring."

---
TEXT TO ANALYZE:
${text.substring(0, 4000)}
---

BRAND VOICE DESCRIPTION:`;

    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return response.text;
}

export async function analyzeBrandVoiceFromUrl(url: string): Promise<string> {
    const prompt = `You are an expert brand strategist with the ability to analyze web content. I will provide you with a URL. Your task is to analyze the content on that page to understand the brand's voice.
Based on your analysis of the page's tone, style, vocabulary, and sentence structure, write a short, one-paragraph description of this brand voice. This description will be used as a system instruction for an AI to generate future content that matches this voice.
The description should be clear, concise, and actionable for an AI. For example: "The brand voice is warm, knowledgeable, and slightly scientific. It uses clear, accessible language but isn't afraid to reference key ingredients. Sentences are generally short and direct. The tone is empowering and reassuring."

---
URL TO ANALYZE:
${url}
---

BRAND VOICE DESCRIPTION:`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    
    return response.text;
}

export async function generateCustomerPersona(description: string): Promise<CustomerPersona> {
    const prompt = `
You are a marketing and user research expert.
Based on the following description of a target audience, create a detailed, realistic customer persona.
The persona should be a single, fictional individual that represents the key traits of the audience.

**Target Audience Description:**
"${description}"

**Instructions:**
Generate a persona with the following attributes:
- A plausible Pakistani name.
- Age, occupation, and location (a major Pakistani city).
- Skincare goals (what they want to achieve).
- Pain points (their struggles with skincare).
- Motivations (what drives their purchasing decisions).
- A short personality summary.
- A brief bio that brings the persona to life.

Return the response in the specified JSON format.
`;

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
