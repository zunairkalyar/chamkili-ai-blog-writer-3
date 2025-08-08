
import { Type } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';
import { ai, PRODUCT_LINKS } from "./client";
import { OutlineBlock, CustomerPersona, StreamBlock, ReferenceImage } from "./types";
import { InternalLink } from "../../types";

export async function generateBlogOutline(title: string, keywords: string, contentTemplate: string, authorPersona: string, brandVoiceProfile: string | null, persona: CustomerPersona | null): Promise<OutlineBlock[]> {
    const keywordsPrompt = keywords ? `The article should target these SEO keywords: "${keywords}".` : '';
    const brandVoicePrompt = brandVoiceProfile ? `**Brand Voice Profile:** ${brandVoiceProfile}` : '';
    const personaPrompt = persona ? `**Target Audience Persona:**\n${JSON.stringify(persona, null, 2)}\nTailor the outline to resonate with this specific person.` : '';


    const prompt = `You are a strategic content planner for Chamkili, a Pakistani skincare brand. Your persona is: "${authorPersona}".
Your task is to create a detailed blog post outline.

**Blog Topic:** "${title}"
${keywordsPrompt}
${brandVoicePrompt}
${personaPrompt}

**Instructions:**
1.  Analyze the topic, keywords, brand voice, and persona.
2.  Create a logical structure for a compelling blog post based on the "${contentTemplate}" template.
3.  The outline should consist of an introduction, several main sections (with H2 headings), and a conclusion.
4.  For each section, list the key talking points or questions to be answered.
5.  Return the response in the specified JSON format.

**JSON Response Format:**
The output must be a JSON array of objects. Each object represents a section of the blog post and must have "id", "heading", and "keyPoints" properties.
- "id": A unique string identifier.
- "heading": The proposed H2 heading for the section. For the intro/outro, use "Introduction" or "Conclusion".
- "keyPoints": A single string containing a bulleted or numbered list of key points to cover in that section. Use markdown-style lists (e.g., "- Point 1\n- Point 2").
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
                        id: { type: Type.STRING },
                        heading: { type: Type.STRING },
                        keyPoints: { type: Type.STRING }
                    },
                    required: ['id', 'heading', 'keyPoints']
                }
            }
        }
    });
    
    const parsed = JSON.parse(response.text) as Omit<OutlineBlock, 'id'>[];
    return parsed.map(item => ({...item, id: uuidv4() }));
}

export async function regenerateOutlineSection(blogTitle: string, sectionHeading: string): Promise<Pick<OutlineBlock, 'keyPoints'>> {
    const prompt = `
    You are a strategic content planner. A blog post is being created with the title "${blogTitle}".
    Your task is to generate a new set of key points for a specific section of this blog post.

    **Section Heading:** "${sectionHeading}"

    **Instructions:**
    Generate a bulleted or numbered list of key talking points for this section. The points should be insightful and directly related to the section heading and the overall blog topic.
    Return ONLY the key points in the specified JSON format.

    **JSON Response Format:**
    The output must be a JSON object with a single "keyPoints" property.
    - "keyPoints": A single string containing a markdown-style bulleted or numbered list of key points.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    keyPoints: { type: Type.STRING }
                },
                required: ['keyPoints']
            }
        }
    });

    return JSON.parse(response.text) as Pick<OutlineBlock, 'keyPoints'>;
}


export async function* generateBlogPostStream(
    title: string, 
    tone: string, 
    keywords: string, 
    referenceImage: ReferenceImage | null, 
    contentTemplate: string, 
    authorPersona: string, 
    brandVoiceProfile: string | null, 
    outline: OutlineBlock[],
    internalLinkableContent: InternalLink[],
    persona: CustomerPersona | null,
    ): AsyncGenerator<StreamBlock, void, undefined> {
    
    const keywordsPrompt = keywords ? `Please naturally incorporate the following SEO keywords: "${keywords}".` : '';
    const imagePromptInstruction = referenceImage ? `You have been provided with a reference image. Use it as the primary source of inspiration for the blog post's tone, style, and especially for the visual descriptions in your image suggestions. The images you suggest should match the aesthetic and content of the reference image.` : '';
    const brandVoicePrompt = brandVoiceProfile ? `**Brand Voice Profile:** Adhere strictly to this voice: ${brandVoiceProfile}` : '';
    const personaPrompt = persona ? `**Target Audience Persona:** Write directly to this person:\n${JSON.stringify(persona, null, 2)}` : '**Target Audience:** Pakistani women aged 18–35.';
    const internalLinkPrompt = internalLinkableContent.length > 0 ? `**Internal Linking:** Here is a list of existing articles on the blog: ${JSON.stringify(internalLinkableContent)}. If you discuss a topic covered in one of these articles, create a hyperlink to its URL within the text. Use natural anchor text.` : '';

    const outlinePrompt = `**Article Outline to Follow:**
You MUST follow this exact outline. Write the content for each section based on its heading and key points.
${JSON.stringify(outline, null, 2)}
`;


    const textPrompt = `You are an expert skincare copywriter for Chamkili, a Pakistani skincare brand. Your persona is: "${authorPersona}". Your job is to write a detailed, SEO-friendly blog post based on the provided outline.

**Blog Topic:** "${title}"
${personaPrompt}
**Tone of Voice:** "${tone}"
${brandVoicePrompt}
${keywordsPrompt}
${imagePromptInstruction}
${internalLinkPrompt}
${outlinePrompt}

**Products to Feature:**
- Vitamin C Serum: ${PRODUCT_LINKS[0]}
- Niacinamide + Zinc Serum: ${PRODUCT_LINKS[1]}

**Instructions:**

1.  **Follow the Outline:** Write the full article section by section, adhering to the provided outline. The first section should contain the H1 title.
2.  **Incorporate Links:** Strategically and naturally embed the product links and internal links where they make sense. The link text should be descriptive and compelling.
3.  **Suggest Images:** As you write, identify 2-3 logical places for relevant images. For each location, create a detailed, descriptive image generation prompt.
4.  **Format as a Stream of JSON Objects:** Your entire output MUST be a stream of individual JSON objects, one per line. **DO NOT** wrap the output in a JSON array. Each JSON object must conform to one of the following structures:

    -   **For text content:**
        \`{"type": "html", "content": "<h1>...</h1>"}\`
        \`{"type": "html", "content": "<h2>...</h2><p>...</p>"}\`
        (Use only \`<h1>\`, \`<h2>\`, \`<p>\`, \`<ul>\`, \`<li>\` tags. Product links should be included inside these HTML strings as \`<a>\` tags.)

    -   **For image placeholders:**
        \`{"type": "image_suggestion", "content": "A detailed prompt for the image..."}\`
5.  **Word Count:** The final blog post should be comprehensive yet concise, aiming for a total word count of 500-700 words.`;

    let contents;

    if (referenceImage) {
        contents = { parts: [{ inlineData: { data: referenceImage.data, mimeType: referenceImage.mimeType } }, { text: textPrompt }] };
    } else {
        contents = textPrompt;
    }


    try {
        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                temperature: 0.6,
                topP: 0.95,
                topK: 40,
            }
        });

        let buffer = '';
        for await (const chunk of stream) {
            buffer += chunk.text;
            let EOL; // End of line
            while ((EOL = buffer.indexOf('\n')) > -1) {
                const line = buffer.substring(0, EOL).trim();
                buffer = buffer.substring(EOL + 1);
                if (line) {
                    try { yield JSON.parse(line); } 
                    catch (e) { console.warn("Could not parse stream line as JSON, skipping:", line); }
                }
            }
        }
        if (buffer.trim()) {
             try { yield JSON.parse(buffer); } 
             catch (e) { console.warn("Could not parse final stream buffer as JSON, skipping:", buffer); }
        }

    } catch (error) {
        console.error("Error generating blog post stream:", error);
        throw new Error(`Failed to generate content from AI: ${error instanceof Error ? error.message : String(error)}`);
    }
}
