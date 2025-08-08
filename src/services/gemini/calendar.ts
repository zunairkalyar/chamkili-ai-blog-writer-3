
import { Type } from "@google/genai";
import { ai } from "./client";
import { CalendarTopic, CustomerPersona } from "./types";

export async function generateContentCalendar(goal: string, month: string, persona: CustomerPersona | null, brandVoiceProfile: string | null): Promise<CalendarTopic[]> {
    const prompt = `Create a content calendar for ${month}. Goal: "${goal}".
Brand Voice: ${brandVoiceProfile || 'default'}.
Target Persona: ${persona ? JSON.stringify(persona) : 'general audience'}.
Generate 8-10 ideas. Return a JSON array of {date, title, keywords, contentType, notes}.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        date: { type: Type.STRING },
                        title: { type: Type.STRING },
                        keywords: { type: Type.STRING },
                        contentType: { type: Type.STRING },
                        notes: { type: Type.STRING },
                    },
                    required: ['date', 'title', 'keywords', 'contentType', 'notes'],
                }
            }
        }
    });
    return JSON.parse(response.text) as CalendarTopic[];
}
