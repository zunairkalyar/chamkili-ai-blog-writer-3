
import { InternalLink } from '../types';

// Using a public proxy for demonstration. For production, a private proxy is recommended.
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';


// Helper to create a title from a URL slug
const slugToTitle = (slug: string): string => {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export async function fetchAndParseSitemap(url: string): Promise<InternalLink[]> {
    try {
        const response = await fetch(`${CORS_PROXY}${url}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
        }
        const xmlText = await response.text();
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");
        
        const errorNode = xmlDoc.querySelector("parsererror");
        if (errorNode) {
            console.error("Parser Error:", errorNode.textContent);
            throw new Error("Failed to parse sitemap XML. Check if the URL is a valid XML sitemap and accessible.");
        }

        const locs = xmlDoc.querySelectorAll("loc");
        const links: InternalLink[] = [];

        locs.forEach(loc => {
            if (loc.textContent) {
                const fullUrl = loc.textContent;
                try {
                    const urlObject = new URL(fullUrl);
                    // Get the last part of the path, which is usually the slug
                    const slug = urlObject.pathname.split('/').filter(Boolean).pop() || '';
                    links.push({
                        url: fullUrl,
                        title: slugToTitle(slug)
                    });
                } catch (e) {
                    console.warn(`Invalid URL found in sitemap, skipping: ${fullUrl}`);
                }
            }
        });

        return links;

    } catch (error) {
        console.error("Sitemap fetching/parsing error:", error);
        throw new Error(`Could not process sitemap. Please check the URL and ensure it's accessible. Error: ${error instanceof Error ? error.message : String(error)}`);
    }
}
