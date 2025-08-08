
import { Type } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';
import { ai } from "./client";
import { CampaignPlan, CustomerPersona, SocialAssetPlan, EmailPlan, AdPlan, GeneratedEmail, GeneratedAd } from "./types";
import { repurposeContent } from "./content";
import { RepurposePlatform } from "../../types";

export async function generateCampaignPlan(goal: string, brandVoiceProfile: string | null, persona: CustomerPersona | null): Promise<CampaignPlan> {
    const brandVoicePrompt = brandVoiceProfile ? `**Brand Voice Profile:** ${brandVoiceProfile}` : '';
    const personaPrompt = persona ? `**Target Audience Persona:**\n${JSON.stringify(persona, null, 2)}\nAll content in this campaign must be tailored to this specific persona.` : '';

    const prompt = `
You are a master marketing strategist for Chamkili, a Pakistani skincare brand.
Your task is to create a comprehensive, multi-channel marketing campaign plan based on a single goal.

**Campaign Goal:** "${goal}"
${brandVoicePrompt}
${personaPrompt}

**Instructions:**
1.  **Blog Post:** Create a detailed outline for a cornerstone blog post that supports the campaign goal.
2.  **Social Assets:** Propose a plan for social media. This should include two tweets, one LinkedIn post, and one Instagram post. For each, provide a concise topic or angle.
3.  **Email Drip Campaign:** Plan a 3-part email drip campaign. For each email, provide an enticing subject line and a topic/angle.
4.  **Ad Copy:** Plan 2-3 distinct ad copy variations. For each, provide a compelling headline and describe the ad's purpose (e.g., brand awareness, direct response).
5.  Return the response in the specified JSON format. Ensure all IDs are unique strings.

**JSON Schema:** The output must be a JSON object with properties: "blogPostOutline", "socialAssetPlan", "emailDripPlan", "adCopyPlan".
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    blogPostOutline: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                heading: { type: Type.STRING },
                                keyPoints: { type: Type.STRING }
                            },
                            required: ['id', 'heading', 'keyPoints']
                        }
                    },
                    socialAssetPlan: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                type: { type: Type.STRING, enum: ['twitter', 'linkedin', 'instagram'] },
                                topic: { type: Type.STRING }
                            },
                             required: ['id', 'type', 'topic']
                        }
                    },
                    emailDripPlan: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                subject: { type: Type.STRING },
                                topic: { type: Type.STRING }
                            },
                            required: ['id', 'subject', 'topic']
                        }
                    },
                     adCopyPlan: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                headline: { type: Type.STRING },
                                purpose: { type: Type.STRING }
                            },
                            required: ['id', 'headline', 'purpose']
                        }
                    }
                },
                required: ['blogPostOutline', 'socialAssetPlan', 'emailDripPlan', 'adCopyPlan']
            }
        }
    });

    const parsed = JSON.parse(response.text) as CampaignPlan;
    // Ensure IDs are unique
    parsed.blogPostOutline = parsed.blogPostOutline.map(p => ({ ...p, id: uuidv4() }));
    parsed.socialAssetPlan = parsed.socialAssetPlan.map(a => ({ ...a, id: uuidv4() }));
    parsed.emailDripPlan = parsed.emailDripPlan.map(a => ({ ...a, id: uuidv4() }));
    parsed.adCopyPlan = parsed.adCopyPlan.map(a => ({ ...a, id: uuidv4() }));
    return parsed;
}

export async function generateSingleCampaignAsset(blogContent: string, assetPlan: SocialAssetPlan, brandVoiceProfile: string | null, persona: CustomerPersona | null): Promise<string> {
    return repurposeContent(
        `${assetPlan.topic}\n\nKey information from the main blog post:\n${blogContent}`, 
        assetPlan.type as RepurposePlatform,
        brandVoiceProfile,
        persona,
    );
}

export async function generateCampaignEmail(blogText: string, emailPlan: EmailPlan, brandVoiceProfile: string | null, persona: CustomerPersona | null): Promise<GeneratedEmail> {
     const brandVoicePrompt = brandVoiceProfile ? `The post must adhere to this brand voice: ${brandVoiceProfile}` : '';
    const personaPrompt = persona ? `**Target Audience Persona:** Write directly to this person:\n${JSON.stringify(persona, null, 2)}` : '';

    const prompt = `You are an expert email marketer for Chamkili. Your task is to write a compelling email based on a plan, using content from a blog post as a reference.

**Email Plan:**
- Subject: "${emailPlan.subject}"
- Topic/Angle: "${emailPlan.topic}"

${brandVoicePrompt}
${personaPrompt}

**Reference Blog Post Content:**
${blogText.substring(0, 4000)}

**Instructions:** Write the full email body. It should be friendly, engaging, and encourage the reader to learn more. Start with a personal greeting (e.g., "Hi [Name],"). End with a clear call-to-action. Return ONLY the email body as a plain text string.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return {
        id: emailPlan.id,
        subject: emailPlan.subject,
        body: response.text,
    };
}

export async function generateCampaignAd(blogText: string, adPlan: AdPlan, brandVoiceProfile: string | null, persona: CustomerPersona | null): Promise<GeneratedAd> {
    const brandVoicePrompt = brandVoiceProfile ? `The post must adhere to this brand voice: ${brandVoiceProfile}` : '';
    const personaPrompt = persona ? `**Target Audience Persona:** Write directly to this person:\n${JSON.stringify(persona, null, 2)}` : '';

    const prompt = `You are a world-class performance marketer for Chamkili. Your task is to write compelling ad copy based on a plan, using content from a blog post as a reference.

**Ad Plan:**
- Headline: "${adPlan.headline}"
- Purpose: "${adPlan.purpose}"

${brandVoicePrompt}
${personaPrompt}

**Reference Blog Post Content:**
${blogText.substring(0, 3000)}

**Instructions:** Write the ad body text. It should be concise (2-3 sentences), persuasive, and directly related to the headline and purpose. It needs to grab attention and drive clicks. Return ONLY the ad body text as a plain text string.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    
    return {
        id: adPlan.id,
        headline: adPlan.headline,
        body: response.text,
    };
}
