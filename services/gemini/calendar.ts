import { Type } from "@google/genai";
import { ai } from "./client";
import { CalendarTopic, CustomerPersona } from "./types";

export async function generateContentCalendar(goal: string, month: string, persona: CustomerPersona | null, brandVoiceProfile: string | null): Promise<CalendarTopic[]> {
    const brandVoicePrompt = brandVoiceProfile ? `**Brand Voice Profile:** ${brandVoiceProfile}` : '';
    const personaPrompt = persona ? `**Target Audience Persona:**\n${JSON.stringify(persona, null, 2)}\nAll content in this calendar must be tailored to this specific persona.` : '';

    const prompt = `
You are a master content strategist for Chamkili, a Pakistani skincare brand.
Your task is to create a strategic content calendar for the month of **${month}**.

**Overall Goal for the Month:** "${goal}"
${brandVoicePrompt}
${personaPrompt}

**Instructions:**
1.  Generate 8-10 diverse content ideas distributed logically throughout the month.
2.  For each idea, provide:
    -   **date:** A target publish date in "YYYY-MM-DD" format within the specified month.
    -   **title:** A compelling, SEO-friendly blog post title.
    -   **keywords:** A comma-separated string of 3-5 relevant SEO keywords.
    -   **contentType:** The most suitable content type from this list: ['Standard Blog Post', 'Step-by-Step Guide', 'Product Deep Dive', 'Myth Busting'].
    -   **notes:** A brief (1-2 sentences) note on the strategic angle or hook for the post.
3.  Return the response ONLY as a JSON array of objects.

**JSON Schema:** The output must be a JSON array of objects matching the specified format.
`;

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
                        date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
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
