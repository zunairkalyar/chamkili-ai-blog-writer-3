import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

export const ai = new GoogleGenAI({ apiKey: API_KEY });

export const PRODUCT_LINKS = [
    'https://www.chamkili.com/products/vitamin-c-skin-serum',
    'https://www.chamkili.com/products/niacinamide-zinc-skin-serum'
];
