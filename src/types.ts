

import { OutlineBlock, SeoFaqData, CustomerPersona, CampaignAsset, GeneratedEmail, GeneratedAd } from './services/gemini';

// This was in BlogPostDisplay, moving it here to be central
export interface ContentBlock {
  id: string;
  type: 'html' | 'image';
  data: any;
}

export const TONES = ['Warm & Friendly', 'Professional', 'Playful', 'Scientific', 'Empathetic'];
export const ASPECT_RATIOS = {
  'Landscape (16:9)': '16:9',
  'Portrait (9:16)': '9:16',
  'Square (1:1)': '1:1',
  'Standard (4:3)': '4:3',
  'Tall (3:4)': '3:4',
};
export const CONTENT_TEMPLATES = ['Standard Blog Post', 'Step-by-Step Guide', 'Product Deep Dive', 'Myth Busting'];
export const AUTHOR_PERSONAS = ['Beauty Guru', 'The Dermatologist', 'Skincare Scientist'];
export const IMAGE_STYLES = ['Default', 'Minimalist & Clean', 'Lush & Organic', 'Luxury & Gold', 'Vibrant & Playful'];


export interface ImageState {
  status: 'loading' | 'success' | 'error';
  url?: string;
  prompt: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  outline: OutlineBlock[];
  content: ContentBlock[];
  tone: string;
  keywords: string;
  aspectRatio: string;
  seoData: SeoFaqData | null;
  contentTemplate: string;
  authorPersona: string;
  imageStyle: string;
  negativeImagePrompt: string;
  customerPersona: CustomerPersona | null;
}

export interface ReferenceImage {
    file: File;
    preview: string;
}

export interface GeneratedCampaignAssets {
    social: CampaignAsset[];
    emails: GeneratedEmail[];
    ads: GeneratedAd[];
}

export interface InternalLink {
  title: string;
  url: string;
}

export type AppState = 'ideation' | 'outline' | 'campaign_plan' | 'generated';
export type AppMode = 'blog' | 'campaign';
export type View = 'dashboard' | 'generator';
export type RepurposePlatform = 'twitter' | 'linkedin' | 'instagram' | 'email';
export type AutopilotStatus = 'idle' | 'working' | 'waiting' | 'error';

export interface MagicWandState {
  visible: boolean;
  top: number;
  left: number;
  selectedText: string;
}

export type RewriteInstruction = 'rewrite' | 'shorten' | 'expand' | 'make more professional';
