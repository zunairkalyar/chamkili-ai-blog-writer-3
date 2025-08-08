
import TurndownService from 'turndown';
import { ContentBlock, ImageState } from '../types';
import { SeoFaqData } from '../services/gemini';


const turndownService = new TurndownService();

export function convertBlocksToHtml(blocks: ContentBlock[], imageStates: Record<string, ImageState>): string {
    return blocks.map(block => {
        if (block.type === 'html') {
            return block.data.html;
        }
        if (block.type === 'image') {
            const state = imageStates[block.id];
            if (state?.status === 'success' && state.url) {
                const altText = state.prompt.substring(0, 100).replace(/"/g, '&quot;');
                return `<p><img src="${state.url}" alt="${altText}" style="width: 100%; height: auto; border-radius: 12px; margin: 1.5rem 0; box-shadow: 0 4px 6px -1px #0000001a;" /></p>`;
            }
        }
        return '';
    }).join('\n');
}

export function convertBlocksToMarkdown(blocks: ContentBlock[], imageStates: Record<string, ImageState>): string {
    const html = convertBlocksToHtml(blocks, imageStates);
    return turndownService.turndown(html);
}

export function convertBlocksToText(blocks: ContentBlock[]): string {
    const html = blocks.map(block => block.type === 'html' ? block.data.html : '').join('\n');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
}

export function convertFaqToHtml(faq: SeoFaqData['faq']): string {
  if (!faq || faq.length === 0) return '';

  const faqItems = faq.map(item => `
    <details style="margin-bottom: 1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem;">
      <summary style="font-weight: 600; cursor: pointer;">${item.question}</summary>
      <p style="margin-top: 0.75rem;">${item.answer}</p>
    </details>
  `).join('');

  return `
    <div style="margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px dashed #e0d1c8;">
        <h2 style="font-family: 'Playfair Display', serif; color: #C57F5D; margin-bottom: 1.5rem;">Frequently Asked Questions</h2>
        ${faqItems}
    </div>
  `;
}
