export interface StreamBlock {
    type: 'html' | 'image_suggestion';
    content: string;
}

export interface ReferenceImage {
    data: string; // base64
    mimeType: string;
}

export interface SeoFaqData {
    metaTitles: string[];
    metaDescriptions: string[];
    faq: {
        question: string;
        answer: string;
    }[];
    keyTakeaways: string[];
}

export interface OutlineBlock {
    id: string;
    heading: string;
    keyPoints: string;
}

export interface SocialAssetPlan {
    id:string;
    type: 'twitter' | 'linkedin' | 'instagram';
    topic: string;
}

export interface EmailPlan {
    id: string;
    subject: string;
    topic: string;
}

export interface AdPlan {
    id: string;
    headline: string;
    purpose: string;
}

export interface CampaignPlan {
    blogPostOutline: OutlineBlock[];
    socialAssetPlan: SocialAssetPlan[];
    emailDripPlan: EmailPlan[];
    adCopyPlan: AdPlan[];
}

export interface CampaignAsset {
    id: string;
    type: 'twitter' | 'linkedin' | 'instagram';
    topic: string;
    content: string;
}

export interface GeneratedEmail {
    id: string;
    subject: string;
    body: string;
}

export interface GeneratedAd {
    id: string;
    headline: string;
    body: string;
}

export interface CompetitorAnalysis {
    strengths: string[];
    weaknesses: string[];
    contentGapOpportunities: string[];
    suggestedOutline: OutlineBlock[];
}

export interface SeoScore {
    score: number;
    recommendations: string[];
}

export interface TrendingTopicSource {
    uri: string;
    title: string;
}

export interface TrendingTopic {
    topic: string;
    reason: string;
}

export interface TrendingTopicResult {
    topics: TrendingTopic[];
    sources: TrendingTopicSource[];
}

export interface CustomerPersona {
    name: string;
    age: number;
    occupation: string;
    location: string;
    skincareGoals: string[];
    painPoints: string[];
    motivations: string[];
    personality: string;
    bio: string;
}

export interface CalendarTopic {
    date: string; // "YYYY-MM-DD"
    title: string;
    keywords: string;
    contentType: string;
    notes: string;
}
