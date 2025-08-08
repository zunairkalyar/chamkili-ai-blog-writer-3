
import { ai } from "./client";
import { RepurposePlatform } from "../../types";
import { CustomerPersona } from "./types";

const getPlatformInstructions = (platform: RepurposePlatform): string => {
    switch(platform) {
        case 'twitter': return `Format for a Twitter thread. First tweet is a hook. Use emojis and #hashtags.`;
        case 'linkedin': return `Format for a professional LinkedIn post. Start with a hook, use bullet points, end with a question.`;
        case 'instagram': return `Format for an engaging Instagram caption. Start with a hook, use emojis, and end with a call-to-action.`;
        case 'email': return `Format for an email newsletter. Write a subject line and a body summarizing the post with a CTA.`;
    }
}

export async function repurposeContent(blogContent: string, platform: RepurposePlatform, brandVoiceProfile: string | null, persona: CustomerPersona | null): Promise<string> {
    const prompt = `Repurpose the following blog post for ${platform}.
Brand Voice: ${brandVoiceProfile || 'default'}.
Target Persona: ${persona ? JSON.stringify(persona) : 'general audience'}.
${getPlatformInstructions(platform)}
Blog Content: ${blogContent.substring(0, 5000)}`;

    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return response.text;
}

export async function rewriteText(text: string, instruction: string): Promise<string> {
    const prompt = `Rewrite the text based on the instruction: "${instruction}".
Original Text: "${text}"
Return only the rewritten text.`;
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return response.text.trim();
}
