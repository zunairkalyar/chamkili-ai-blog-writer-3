
import { Type } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';
import { ai } from "./client";
import { CampaignPlan, CustomerPersona, SocialAssetPlan, EmailPlan, AdPlan, GeneratedEmail, GeneratedAd } from "./types";
import { repurposeContent } from "./content";
import { RepurposePlatform } from "../../types";

export async function generateCampaignPlan(goal: string, brandVoiceProfile: string | null, persona: CustomerPersona | null): Promise<CampaignPlan> {
    const prompt = `Create a multi-channel marketing campaign plan for the goal: "${goal}".
Brand Voice: ${brandVoiceProfile || 'default'}.
Target Persona: ${persona ? JSON.stringify(persona) : 'general audience'}.
Return JSON with {blogPostOutline, socialAssetPlan, emailDripPlan, adCopyPlan}.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    blogPostOutline: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, heading: { type: Type.STRING }, keyPoints: { type: Type.STRING } } } },
                    socialAssetPlan: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, type: { type: Type.STRING }, topic: { type: Type.STRING } } } },
                    emailDripPlan: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, subject: { type: Type.STRING }, topic: { type: Type.STRING } } } },
                    adCopyPlan: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, headline: { type: Type.STRING }, purpose: { type: Type.STRING } } } },
                },
                required: ['blogPostOutline', 'socialAssetPlan', 'emailDripPlan', 'adCopyPlan']
            }
        }
    });

    const parsed = JSON.parse(response.text) as CampaignPlan;
    parsed.blogPostOutline.forEach(p => p.id = uuidv4());
    parsed.socialAssetPlan.forEach(p => p.id = uuidv4());
    parsed.emailDripPlan.forEach(p => p.id = uuidv4());
    parsed.adCopyPlan.forEach(p => p.id = uuidv4());
    return parsed;
}

export async function generateSingleCampaignAsset(blogContent: string, assetPlan: SocialAssetPlan, brandVoiceProfile: string | null, persona: CustomerPersona | null): Promise<string> {
    return repurposeContent(
        `${assetPlan.topic}\n\nReference blog content:\n${blogContent}`, 
        assetPlan.type as RepurposePlatform,
        brandVoiceProfile,
        persona,
    );
}

export async function generateCampaignEmail(blogText: string, emailPlan: EmailPlan, brandVoiceProfile: string | null, persona: CustomerPersona | null): Promise<GeneratedEmail> {
    const prompt = `Write an email for a campaign.
Subject: "${emailPlan.subject}"
Topic: "${emailPlan.topic}"
Reference Blog Content: ${blogText.substring(0, 3000)}
Return only the email body as plain text.`;

    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return { id: emailPlan.id, subject: emailPlan.subject, body: response.text };
}

export async function generateCampaignAd(blogText: string, adPlan: AdPlan, brandVoiceProfile: string | null, persona: CustomerPersona | null): Promise<GeneratedAd> {
    const prompt = `Write ad copy for a campaign.
Headline: "${adPlan.headline}"
Purpose: "${adPlan.purpose}"
Reference Blog Content: ${blogText.substring(0, 3000)}
Return only the ad body text.`;

    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return { id: adPlan.id, headline: adPlan.headline, body: response.text };
}
