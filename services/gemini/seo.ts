import { Type } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';
import { ai } from "./client";
import { SeoFaqData, CompetitorAnalysis, SeoScore, OutlineBlock } from "./types";

export async function generateSeoAndFaq(blogContentHtml: string, blogTitle: string, keywords: string): Promise<SeoFaqData> {
    const keywordsPrompt = keywords ? `The blog is targeting these SEO keywords: "${keywords}". Ensure the meta title and description align with them.` : '';
    const prompt = `
        Based on the following blog post content and title, please generate SEO metadata, a Frequently Asked Questions (FAQ) section, and a Key Takeaways section.
        **Blog Title:** "${blogTitle}"
        ${keywordsPrompt}
        **Blog Content (Plain Text):**
        ---
        ${blogContentHtml.replace(/<[^>]*>?/gm, ' ').substring(0, 4000)}
        ---
        **Instructions:**
        1.  **Meta Titles:** Create 3 compelling, distinct, and SEO-friendly meta title options. Each must be under 60 characters.
        2.  **Meta Descriptions:** Write 3 engaging and distinct meta description options for search engine results. Each should entice users to click and be under 160 characters.
        3.  **FAQ Section:** Generate 3-4 relevant "Frequently Asked Questions" with clear, concise answers based on the blog post's content.
        4.  **Key Takeaways:** Generate a list of 2-4 key takeaways from the article, presented as a simple list of strings.
        Return the response in the specified JSON format.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        metaTitles: { 
                            type: Type.ARRAY,
                            description: "An array of 3 distinct, compelling, SEO-friendly meta titles, each under 60 characters.",
                            items: { type: Type.STRING }
                        },
                        metaDescriptions: { 
                            type: Type.ARRAY,
                            description: "An array of 3 distinct, engaging meta descriptions, each under 160 characters.",
                            items: { type: Type.STRING }
                        },
                        faq: {
                            type: Type.ARRAY,
                            description: "An array of 3-4 frequently asked questions with answers.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    answer: { type: Type.STRING }
                                },
                                required: ['question', 'answer']
                            }
                        },
                        keyTakeaways: {
                            type: Type.ARRAY,
                            description: "A list of 2-4 key takeaways from the article.",
                            items: { type: Type.STRING }
                        }
                    },
                    required: ['metaTitles', 'metaDescriptions', 'faq', 'keyTakeaways']
                },
            },
        });

        return JSON.parse(response.text) as SeoFaqData;
    } catch(error) {
        console.error("Error generating SEO & FAQ data:", error);
        throw new Error(`Failed to generate SEO data from AI: ${error instanceof Error ? error.message : String(error)}`);
    }
}


export async function analyzeCompetitorUrl(url: string): Promise<CompetitorAnalysis> {
    const prompt = `
You are a world-class SEO strategist and content analyst.
Analyze the article at the following URL: ${url}

**Instructions:**
Perform a detailed analysis and provide a strategic brief on how to write a better, more comprehensive article that can outrank it.
Your analysis should include:
1.  **Strengths:** What does this article do well? (e.g., good structure, clear explanations, good use of images).
2.  **Weaknesses:** Where does the article fall short? (e.g., outdated information, lacks depth, poor readability).
3.  **Content Gap Opportunities:** What important topics or questions related to the main subject does this article miss?
4.  **Suggested Outline:** Based on your analysis, provide a complete blog post outline (introduction, H2 sections with key points, conclusion) for a superior article.

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
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                    contentGapOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                    suggestedOutline: {
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
                    }
                },
                required: ['strengths', 'weaknesses', 'contentGapOpportunities', 'suggestedOutline']
            }
        }
    });
    const parsed = JSON.parse(response.text) as Omit<CompetitorAnalysis, 'suggestedOutline'> & { suggestedOutline: Omit<OutlineBlock, 'id'>[]};
    const newOutline = parsed.suggestedOutline.map(p => ({ ...p, id: uuidv4() }));
    return { ...parsed, suggestedOutline: newOutline };
}

export async function getSeoScore(htmlContent: string, keywords: string): Promise<SeoScore> {
    const prompt = `
You are an SEO expert. Analyze the following blog post content and its target keywords.
Provide an SEO score from 0 to 100 and a list of actionable recommendations for improvement.

**Target Keywords:** "${keywords}"
**Blog Content (Text):**
---
${htmlContent.replace(/<[^>]*>?/gm, ' ').substring(0, 4000)}
---

**Instructions:**
Evaluate the content based on on-page SEO best practices, including keyword density, readability, structure (assuming H1/H2 tags exist), and relevance to the keywords.
Return a JSON object with a "score" (number) and "recommendations" (an array of strings).
`;

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
