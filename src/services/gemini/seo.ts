
import { Type } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';
import { ai } from "./client";
import { SeoFaqData, CompetitorAnalysis, SeoScore, OutlineBlock } from "./types";

export async function generateSeoAndFaq(blogContentHtml: string, blogTitle: string, keywords: string): Promise<SeoFaqData> {
    const prompt = `From the blog post "${blogTitle}" (keywords: ${keywords}), generate:
1. 3 meta titles (<60 chars)
2. 3 meta descriptions (<160 chars)
3. A 3-4 item FAQ section
4. 2-4 key takeaways
Return JSON with {metaTitles, metaDescriptions, faq, keyTakeaways}.
Content: ${blogContentHtml.replace(/<[^>]*>?/gm, ' ').substring(0, 4000)}`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    metaTitles: { type: Type.ARRAY, items: { type: Type.STRING } },
                    metaDescriptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    faq: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, answer: { type: Type.STRING } } } },
                    keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['metaTitles', 'metaDescriptions', 'faq', 'keyTakeaways']
            },
        },
    });
    return JSON.parse(response.text) as SeoFaqData;
}

export async function analyzeCompetitorUrl(url: string): Promise<CompetitorAnalysis> {
    const prompt = `Analyze the article at ${url}. Provide strengths, weaknesses, content gaps, and a suggested outline to write a better article.
Return JSON with {strengths, weaknesses, contentGapOpportunities, suggestedOutline}.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                    contentGapOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                    suggestedOutline: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, heading: { type: Type.STRING }, keyPoints: { type: Type.STRING } } } }
                },
                required: ['strengths', 'weaknesses', 'contentGapOpportunities', 'suggestedOutline']
            }
        }
    });
    const parsed = JSON.parse(response.text) as CompetitorAnalysis;
    parsed.suggestedOutline.forEach(p => p.id = uuidv4());
    return parsed;
}

export async function getSeoScore(htmlContent: string, keywords: string): Promise<SeoScore> {
    const prompt = `Analyze blog content for SEO. Keywords: "${keywords}".
Evaluate keyword density, readability, structure. Return a JSON object with "score" (0-100) and "recommendations" (array of strings).
Content: ${htmlContent.replace(/<[^>]*>?/gm, ' ').substring(0, 4000)}`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.NUMBER },
                    recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['score', 'recommendations']
            }
        }
    });
    return JSON.parse(response.text) as SeoScore;
}
