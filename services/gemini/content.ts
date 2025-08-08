
import { RepurposePlatform } from "../../types";
import { CustomerPersona } from "./types";
import { ai } from "./client";

const getPlatformInstructions = (platform: RepurposePlatform): string => {
    switch(platform) {
        case 'twitter':
            return `
**Platform:** Twitter/X
**Format:** Create a compelling, numbered Twitter thread (e.g., 1/5, 2/5...).
- The first tweet must be a strong hook to grab attention.
- Each subsequent tweet should cover a key point from the article.
- Use relevant emojis and hashtags (#Skincare, #Beauty, #Pakistan).
- Keep each tweet under 280 characters.`;
        case 'linkedin':
            return `
**Platform:** LinkedIn
**Format:** Create a professional and insightful LinkedIn post.
- Start with a strong opening line or question.
- Use paragraphs and bullet points for readability.
- Frame the content to be valuable for a professional audience.
- End with a question to encourage discussion.
- Include 3-5 relevant hashtags (e.g., #SkincareScience #ProfessionalDevelopment #BeautyIndustry).`;
        case 'instagram':
            return `
**Platform:** Instagram
**Format:** Create an engaging and scannable Instagram caption.
- Start with a captivating hook line.
- Use emojis to break up text and add personality.
- Use short paragraphs and line breaks for easy reading on mobile.
- End with a clear call-to-action or a question to boost engagement.
- Provide a block of 5-10 relevant hashtags at the end, like #Chamkili #PakistaniSkincare #GlowUp #SkinLove.`;
        case 'email':
             return `
**Platform:** Email Newsletter
**Format:** Create a concise and compelling email newsletter summary of the blog post.
- **Subject Line:** Write an enticing subject line that creates curiosity.
- **Body:** Start with a friendly, personal greeting. Summarize the blog post's main points in a skimmable way (use short paragraphs or a bulleted list). Maintain a warm and helpful tone.
- **Call-to-Action:** End with a clear call-to-action button text that encourages readers to view the full post, for example: "Read The Full Guide".`;
    }
}

export async function repurposeContent(
    blogContent: string, 
    platform: RepurposePlatform, 
    brandVoiceProfile: string | null,
    persona: CustomerPersona | null
): Promise<string> {

    const brandVoicePrompt = brandVoiceProfile ? `The post must adhere to this brand voice: ${brandVoiceProfile}` : '';
    const personaPrompt = persona ? `**Target Audience Persona:** Write directly to this person:\n${JSON.stringify(persona, null, 2)}` : '';


    const platformInstructions = getPlatformInstructions(platform);
    
    const prompt = `You are a social media marketing expert for Chamkili, a Pakistani skincare brand.
Your task is to repurpose a blog post into engaging social media content.

${brandVoicePrompt}
${personaPrompt}
${platformInstructions}

---
ORIGINAL BLOG POST CONTENT:
${blogContent.substring(0, 5000)}
---

REPURPOSED CONTENT:
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });
    return response.text;
}

export async function rewriteText(text: string, instruction: string): Promise<string> {
    const prompt = `
Rewrite the following text based on the provided instruction.
Return ONLY the rewritten text, with no extra commentary or markdown.

**Instruction:** "${instruction}"

**Original Text:**
---
${text}
---

**Rewritten Text:**
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });
    return response.text.trim();
}
