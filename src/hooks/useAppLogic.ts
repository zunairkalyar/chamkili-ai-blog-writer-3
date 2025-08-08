

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  generateBlogOutline,
  generateBlogPostStream, 
  generateImage, 
  generateSeoAndFaq, 
  analyzeBrandVoice,
  analyzeBrandVoiceFromUrl,
  regenerateOutlineSection,
  repurposeContent,
  generateCampaignPlan,
  analyzeCompetitorUrl,
  getSeoScore,
  rewriteText,
  getTrendingTopics,
  generateCustomerPersona,
  generateSingleCampaignAsset,
  generateCampaignEmail,
  generateCampaignAd,
  generateContentCalendar,
  SeoFaqData,
  OutlineBlock,
  CampaignPlan,
  CampaignAsset,
  CompetitorAnalysis,
  SeoScore,
  TrendingTopicResult,
  CustomerPersona,
  GeneratedEmail,
  GeneratedAd,
  CalendarTopic,
} from '../services/gemini';
import { getBlogs, createArticle, ShopifyBlog, ShopifyCredentials } from '../services/shopifyService';
import { convertBlocksToHtml, convertFaqToHtml, convertBlocksToText } from '../utils/contentUtils';

import {
    ImageState,
    HistoryItem,
    ReferenceImage,
    GeneratedCampaignAssets,
    AppState,
    AppMode,
    View,
    RepurposePlatform,
    AutopilotStatus,
    MagicWandState,
    TONES,
    ASPECT_RATIOS,
    CONTENT_TEMPLATES,
    AUTHOR_PERSONAS,
    IMAGE_STYLES,
    ContentBlock,
    InternalLink,
    RewriteInstruction
} from '../types';
import { fetchAndParseSitemap } from '../services/sitemapService';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); 
    };
    reader.onerror = (error) => reject(error);
  });
};


export const useAppLogic = () => {
  // App flow state
  const [view, setView] = useState<View>('dashboard');
  const [appMode, setAppMode] = useState<AppMode>('blog');
  const [appState, setAppState] = useState<AppState>('ideation');

  // Form state
  const [blogTitle, setBlogTitle] = useState<string>('');
  const [campaignGoal, setCampaignGoal] = useState<string>('');
  const [seoKeywords, setSeoKeywords] = useState<string>('');
  const [tone, setTone] = useState<string>(TONES[0]);
  const [aspectRatio, setAspectRatio] = useState<string>(ASPECT_RATIOS['Landscape (16:9)']);
  const [referenceImage, setReferenceImage] = useState<ReferenceImage | null>(null);

  // Creative controls state
  const [contentTemplate, setContentTemplate] = useState<string>(CONTENT_TEMPLATES[0]);
  const [authorPersona, setAuthorPersona] = useState<string>(AUTHOR_PERSONAS[0]);
  const [imageStyle, setImageStyle] = useState<string>(IMAGE_STYLES[0]);
  const [negativeImagePrompt, setNegativeImagePrompt] = useState<string>('');
  const [brandVoiceProfile, setBrandVoiceProfile] = useState<string | null>(null);
  const [isBrandVoiceModalOpen, setIsBrandVoiceModalOpen] = useState(false);
  const [customerPersona, setCustomerPersona] = useState<CustomerPersona | null>(null);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);

  // Generation state
  const [outline, setOutline] = useState<OutlineBlock[] | null>(null);
  const [campaignPlan, setCampaignPlan] = useState<CampaignPlan | null>(null);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [campaignAssets, setCampaignAssets] = useState<GeneratedCampaignAssets | null>(null);
  const [imageStates, setImageStates] = useState<Record<string, ImageState>>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState<boolean>(false);
  const [isRegeneratingSection, setIsRegeneratingSection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Repurposing state
  const [repurposedContent, setRepurposedContent] = useState<{ platform: string; content: string } | null>(null);
  const [isRepurposing, setIsRepurposing] = useState(false);

  // Calendar State
  const [calendarPlan, setCalendarPlan] = useState<CalendarTopic[] | null>(null);
  const [isGeneratingCalendar, setIsGeneratingCalendar] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);


  // SEO, Competitor & Trends State
  const [seoData, setSeoData] = useState<SeoFaqData | null>(null);
  const [selectedTitleIndex, setSelectedTitleIndex] = useState(0);
  const [selectedDescriptionIndex, setSelectedDescriptionIndex] = useState(0);
  const [seoScore, setSeoScore] = useState<SeoScore | null>(null);
  const [isGeneratingSeo, setIsGeneratingSeo] = useState<boolean>(false);
  const [isGeneratingSeoScore, setIsGeneratingSeoScore] = useState<boolean>(false);
  const [seoError, setSeoError] = useState<string | null>(null);
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [competitorAnalysis, setCompetitorAnalysis] = useState<CompetitorAnalysis | null>(null);
  const [isAnalyzingCompetitor, setIsAnalyzingCompetitor] = useState(false);
  const [competitorError, setCompetitorError] = useState<string | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopicResult | null>(null);
  const [isFetchingTrends, setIsFetchingTrends] = useState(false);
  const [trendsError, setTrendsError] = useState<string | null>(null);

  // Internal Linking State
  const [sitemapUrl, setSitemapUrl] = useState<string>('https://www.chamkili.com/sitemap_blogs_1.xml');
  const [internalLinks, setInternalLinks] = useState<InternalLink[]>([]);
  const [isParsingSitemap, setIsParsingSitemap] = useState<boolean>(false);
  const [sitemapError, setSitemapError] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historySearchTerm, setHistorySearchTerm] = useState('');


  // Shopify state
  const [isShopifyModalOpen, setIsShopifyModalOpen] = useState(false);
  const [shopifyCreds, setShopifyCreds] = useState<ShopifyCredentials>({ storeName: '', accessToken: '' });
  const [shopifyBlogs, setShopifyBlogs] = useState<ShopifyBlog[]>([]);
  const [selectedShopifyBlog, setSelectedShopifyBlog] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [isFetchingBlogs, setIsFetchingBlogs] = useState(false);
  
  // UI State
  const [activePanels, setActivePanels] = useState<string[]>(['main', 'creative', 'image']);
  const [magicWand, setMagicWand] = useState<MagicWandState>({ visible: false, top: 0, left: 0, selectedText: '' });
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewrittenText, setRewrittenText] = useState<string | null>(null);

  // Auto-Pilot State
  const [isAutopilotActive, setIsAutopilotActive] = useState(false);
  const [autopilotStatus, setAutopilotStatus] = useState<AutopilotStatus>('idle');
  const [autopilotCurrentTask, setAutopilotCurrentTask] = useState('');
  const [autopilotLog, setAutopilotLog] = useState<string[]>([]);
  const [autopilotCountdown, setAutopilotCountdown] = useState(0);
  const [autopilotPublishTrigger, setAutopilotPublishTrigger] = useState<{ blogId: number } | null>(null);
  const autopilotIntervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);


  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('chamkiliBlogHistoryV6');
      if (storedHistory) setHistory(JSON.parse(storedHistory));

      const storedCreds = localStorage.getItem('chamkiliShopifyCreds');
      if (storedCreds) setShopifyCreds(JSON.parse(storedCreds));

      const storedBrandVoice = localStorage.getItem('chamkiliBrandVoice');
      if (storedBrandVoice) setBrandVoiceProfile(storedBrandVoice);
      
      const storedPersona = localStorage.getItem('chamkiliCustomerPersona');
      if (storedPersona) setCustomerPersona(JSON.parse(storedPersona));


    } catch (e) {
      console.error("Could not parse from localStorage", e);
      localStorage.removeItem('chamkiliBlogHistoryV6');
      localStorage.removeItem('chamkiliCustomerPersona');
    }
  }, []);

  useEffect(() => {
    if (shopifyCreds.storeName && shopifyCreds.accessToken) {
      setIsFetchingBlogs(true);
      setPublishError(null);
      getBlogs(shopifyCreds)
        .then(blogs => {
          setShopifyBlogs(blogs);
          if (blogs.length > 0) setSelectedShopifyBlog(String(blogs[0].id));
        })
        .catch(err => {
            console.error("Failed to fetch Shopify blogs", err);
            setPublishError(`Failed to fetch blogs. Check credentials or CORS proxy. Error: ${err.message}`);
        })
        .finally(() => setIsFetchingBlogs(false));
    }
  }, [shopifyCreds]);

  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('chamkiliBlogHistoryV6', JSON.stringify(newHistory));
  };
  
  const handleImageGeneration = async (id: string, prompt: string, ratio: string, style: string, negativePrompt: string) => {
      try {
        const imageUrl = await generateImage(prompt, ratio, style, negativePrompt);
        setImageStates(prev => ({ ...prev, [id]: { status: 'success', url: imageUrl, prompt } }));
      } catch (err) {
        console.error('Image generation failed for prompt:', prompt, err);
        setImageStates(prev => ({ ...prev, [id]: { status: 'error', prompt: prompt } }));
      }
  };

  const resetAll = () => {
    setAppState('ideation');
    setError(null);
    setPublishError(null);
    setPublishSuccess(null);
    setContentBlocks([]);
    setImageStates({});
    setSeoData(null);
    setSelectedTitleIndex(0);
    setSelectedDescriptionIndex(0);
    setSeoError(null);
    setIsGeneratingSeo(false);
    setOutline(null);
    setCampaignPlan(null);
    setCampaignAssets(null);
    setRepurposedContent(null);
    setSeoScore(null);
  }

  const handleGenerate = async () => {
    setIsGeneratingOutline(true);
    resetAll();
    const finalTitle = blogTitle.trim() === '' ? 'Best Skincare Routine for Glowing Skin in Pakistan' : blogTitle.trim();
    try {
      if (appMode === 'blog') {
        const generatedOutline = await generateBlogOutline(finalTitle, seoKeywords, contentTemplate, authorPersona, brandVoiceProfile, customerPersona);
        setOutline(generatedOutline);
        setIsGeneratingOutline(false); // Plan created, now generate content
        await handleGenerateFullArticle(generatedOutline);
      } else { // Campaign mode
        const generatedPlan = await generateCampaignPlan(campaignGoal, brandVoiceProfile, customerPersona);
        setCampaignPlan(generatedPlan);
        setIsGeneratingOutline(false); // Plan created, now generate content
        await handleGenerateCampaign(generatedPlan);
      }
    } catch (err) {
       setError(err instanceof Error ? err.message : 'An unknown error occurred creating the plan.');
       setAppState('ideation');
       setIsGeneratingOutline(false);
    }
  }
  
  const handleRegenerateSection = async (sectionId: string) => {
    if (!outline) return;
    const sectionIndex = outline.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;

    setIsRegeneratingSection(sectionId);
    setError(null);
    const finalTitle = blogTitle.trim() === '' ? 'Best Skincare Routine for Glowing Skin in Pakistan' : blogTitle.trim();

    try {
      const regeneratedSection = await regenerateOutlineSection(
        finalTitle, 
        outline[sectionIndex].heading
      );
      
      const newOutline = [...outline];
      newOutline[sectionIndex] = { ...newOutline[sectionIndex], ...regeneratedSection };
      setOutline(newOutline);

    } catch (err) {
      setError(err instanceof Error ? `Failed to regenerate section: ${err.message}` : 'An unknown error occurred during regeneration.');
    } finally {
      setIsRegeneratingSection(null);
    }
  };

  const handleGenerateFullArticle = useCallback(async (approvedOutline: OutlineBlock[]) => {
    if (!approvedOutline || approvedOutline.length === 0) return null;
    setAppState('generated');
    setIsGenerating(true);
    setError(null);
    setSeoData(null);
    setSeoScore(null);
    setImageStates({});
    
    const finalTitle = blogTitle.trim() === '' ? 'Best Skincare Routine for Glowing Skin in Pakistan' : blogTitle.trim();
    
    try {
      let imageDetails = null;
      if (referenceImage) {
        const base64Data = await fileToBase64(referenceImage.file);
        imageDetails = { data: base64Data, mimeType: referenceImage.file.type };
      }
      
      const historyLinks: InternalLink[] = history.map(h => ({ title: h.title, url: `/blog/${h.title.toLowerCase().replace(/\s+/g, '-')}` }));
      const combinedLinks = [...internalLinks, ...historyLinks];
      const uniqueLinks = Array.from(new Map(combinedLinks.map(item => [item.title, item])).values());

      const stream = generateBlogPostStream(finalTitle, tone, seoKeywords, imageDetails, contentTemplate, authorPersona, brandVoiceProfile, approvedOutline, uniqueLinks, customerPersona);
      const imageGenPromises: Promise<void>[] = [];
      let tempBlocks: ContentBlock[] = [];

      for await (const block of stream) {
        const blockId = uuidv4();
        let newBlock: ContentBlock;
        if (block.type === 'image_suggestion') {
          newBlock = { id: blockId, type: 'image', data: { prompt: block.content } };
          setImageStates(prev => ({...prev, [blockId]: { status: 'loading', prompt: block.content } }));
          imageGenPromises.push(handleImageGeneration(blockId, block.content, aspectRatio, imageStyle, negativeImagePrompt));
        } else {
          newBlock = { id: blockId, type: 'html', data: { html: block.content } };
        }
        tempBlocks.push(newBlock);
        setContentBlocks([...tempBlocks]);
      }
      
      await Promise.all(imageGenPromises);

      setIsGeneratingSeo(true);
      let finalSeoData: SeoFaqData | null = null;
      try {
        const contentForSeo = tempBlocks.filter(b => b.type === 'html').map(b => b.data.html).join(' ');
        const generatedSeo = await generateSeoAndFaq(contentForSeo, finalTitle, seoKeywords);
        setSeoData(generatedSeo);
        setSelectedTitleIndex(0);
        setSelectedDescriptionIndex(0);
        finalSeoData = generatedSeo;
      } catch (seoErr) {
        setSeoError(seoErr instanceof Error ? seoErr.message : 'Failed to generate SEO content.');
      } finally {
        setIsGeneratingSeo(false);
      }

      const newHistoryItem: HistoryItem = {
        id: uuidv4(),
        title: finalTitle,
        outline: approvedOutline,
        content: tempBlocks, 
        tone,
        keywords: seoKeywords,
        aspectRatio,
        seoData: finalSeoData,
        contentTemplate,
        authorPersona,
        imageStyle,
        negativeImagePrompt,
        customerPersona,
      };
      if (appMode === 'blog') {
        const updatedHistory = [newHistoryItem, ...history.slice(0, 19)];
        saveHistory(updatedHistory);
      }
      return tempBlocks;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [blogTitle, seoKeywords, tone, aspectRatio, referenceImage, history, contentTemplate, authorPersona, imageStyle, negativeImagePrompt, brandVoiceProfile, customerPersona, appMode, internalLinks]);

  const handleGenerateCampaign = async (approvedPlan: CampaignPlan) => {
     setCampaignPlan(approvedPlan);
     setAppState('generated');
     setIsGenerating(true);
     setError(null);
     setCampaignAssets(null);

     // 1. Generate Blog Post
     const blogBlocks = await handleGenerateFullArticle(approvedPlan.blogPostOutline);
     
     if (blogBlocks) {
        const blogText = convertBlocksToText(blogBlocks);
        
        // 2. Generate other assets in parallel
        const socialPromises = approvedPlan.socialAssetPlan.map(assetPlan => 
          generateSingleCampaignAsset(blogText, assetPlan, brandVoiceProfile, customerPersona)
            .then(content => ({...assetPlan, content, topic: assetPlan.topic, type: assetPlan.type, id: assetPlan.id }))
            .catch(e => ({...assetPlan, content: `Error generating content: ${e.message}`, topic: assetPlan.topic, type: assetPlan.type, id: assetPlan.id}))
        );

        const emailPromises = approvedPlan.emailDripPlan.map(emailPlan =>
            generateCampaignEmail(blogText, emailPlan, brandVoiceProfile, customerPersona)
                .catch(e => ({...emailPlan, body: `Error generating email body: ${e.message}`}))
        );

        const adPromises = approvedPlan.adCopyPlan.map(adPlan =>
            generateCampaignAd(blogText, adPlan, brandVoiceProfile, customerPersona)
                .catch(e => ({...adPlan, body: `Error generating ad body: ${e.message}`}))
        );

        const [socialAssets, emailAssets, adAssets] = await Promise.all([
            Promise.all(socialPromises),
            Promise.all(emailPromises),
            Promise.all(adPromises)
        ]);
        
        setCampaignAssets({ social: socialAssets, emails: emailAssets, ads: adAssets });
     }
     setIsGenerating(false);
  }

  const handleHistoryClick = (item: HistoryItem) => {
    resetAll();
    setAppMode('blog');
    setView('generator');
    setBlogTitle(item.title);
    setSeoKeywords(item.keywords);
    setTone(item.tone);
    setAspectRatio(item.aspectRatio);
    setReferenceImage(null);
    setContentTemplate(item.contentTemplate || CONTENT_TEMPLATES[0]);
    setAuthorPersona(item.authorPersona || AUTHOR_PERSONAS[0]);
    setImageStyle(item.imageStyle || IMAGE_STYLES[0]);
    setNegativeImagePrompt(item.negativeImagePrompt || '');
    setCustomerPersona(item.customerPersona || null);
    
    setOutline(item.outline);
    setContentBlocks(item.content);
    setSeoData(item.seoData || null);
    setSelectedTitleIndex(0);
    setSelectedDescriptionIndex(0);
    
    setAppState('generated');

    const newImageStates: Record<string, ImageState> = {};
    const currentImageStyle = item.imageStyle || IMAGE_STYLES[0];
    const currentNegativePrompt = item.negativeImagePrompt || '';

    item.content.forEach(block => {
      if (block.type === 'image') {
         newImageStates[block.id] = { status: 'loading', prompt: block.data.prompt };
         handleImageGeneration(block.id, block.data.prompt, item.aspectRatio, currentImageStyle, currentNegativePrompt);
      }
    });
    setImageStates(newImageStates);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleRetryImage = (id: string) => {
    const state = imageStates[id];
    if(state) {
      setImageStates(prev => ({...prev, [id]: {...prev[id], status: 'loading'}}));
      handleImageGeneration(id, state.prompt, aspectRatio, imageStyle, negativeImagePrompt);
    }
  }

  const handleUpdateImagePrompt = (id: string, newPrompt: string) => {
    setImageStates(prev => ({
        ...prev,
        [id]: { ...prev[id], prompt: newPrompt }
    }));
  };

  const handleDeleteHistory = (idToDelete: string) => {
    const newHistory = history.filter(item => item.id !== idToDelete);
    saveHistory(newHistory);
  };
  
  const handleSaveBrandVoice = (profile: string) => {
    setBrandVoiceProfile(profile);
    localStorage.setItem('chamkiliBrandVoice', profile);
  }

  const handleSavePersona = (persona: CustomerPersona) => {
    setCustomerPersona(persona);
    localStorage.setItem('chamkiliCustomerPersona', JSON.stringify(persona));
  }

  const handleRepurpose = async (platform: RepurposePlatform) => {
    if (contentBlocks.length === 0) return;
    setIsRepurposing(true);
    setRepurposedContent(null);
    try {
      const textContent = convertBlocksToText(contentBlocks);
      const result = await repurposeContent(textContent, platform, brandVoiceProfile, customerPersona);
      setRepurposedContent({ platform, content: result });
    } catch (err) {
      console.error("Repurposing failed", err);
    } finally {
      setIsRepurposing(false);
    }
  }

  const handleSaveShopifyCreds = (storeName: string, accessToken: string) => {
    const newCreds = { storeName, accessToken };
    setShopifyCreds(newCreds);
    localStorage.setItem('chamkiliShopifyCreds', JSON.stringify(newCreds));
    setPublishError(null);
    setPublishSuccess(null);
    setIsShopifyModalOpen(false);
  };

  const handlePublish = async () => {
    if (!selectedShopifyBlog || contentBlocks.length === 0) return;
    
    setIsPublishing(true);
    setPublishError(null);
    setPublishSuccess(null);

    try {
        const blogId = parseInt(selectedShopifyBlog, 10);
        let htmlContent = convertBlocksToHtml(contentBlocks, imageStates);
        
        const selectedMetaTitle = seoData?.metaTitles[selectedTitleIndex];
        const selectedMetaDescription = seoData?.metaDescriptions[selectedDescriptionIndex];

        if (seoData?.faq && seoData.faq.length > 0) {
            htmlContent += convertFaqToHtml(seoData.faq);
        }

        const result = await createArticle(shopifyCreds, blogId, htmlContent, selectedMetaTitle, selectedMetaDescription);
        setPublishSuccess(`Successfully published article! Shopify ID: ${result.article.id}`);
    } catch (err) {
        setPublishError(err instanceof Error ? err.message : 'An unknown error occurred during publishing.');
    } finally {
        setIsPublishing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReferenceImage({ file, preview: URL.createObjectURL(file) });
    }
  };

  const handleRemoveImage = () => {
    if (referenceImage) {
      URL.revokeObjectURL(referenceImage.preview);
      setReferenceImage(null);
    }
  };

  const handleAnalyzeCompetitor = async () => {
    if (!competitorUrl) return;
    setIsAnalyzingCompetitor(true);
    setCompetitorAnalysis(null);
    setCompetitorError(null);
    try {
      const analysis = await analyzeCompetitorUrl(competitorUrl);
      setCompetitorAnalysis(analysis);
    } catch (err) {
      setCompetitorError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsAnalyzingCompetitor(false);
    }
  };
  
  const handleAnalyzeSeoScore = async () => {
    const content = convertBlocksToText(contentBlocks);
    if (!content) return;
    setIsGeneratingSeoScore(true);
    setSeoScore(null);
    try {
      const scoreData = await getSeoScore(content, seoKeywords);
      setSeoScore(scoreData);
    } catch (err) {
        // You can add a specific error state for SEO score if needed
    } finally {
      setIsGeneratingSeoScore(false);
    }
  };

  const handleTextSelection = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isRewriting) return;
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 10) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setMagicWand({
            visible: true,
            top: rect.top + window.scrollY - 45,
            left: rect.left + window.scrollX + (rect.width / 2) - 50,
            selectedText: selection.toString(),
        });
    } else {
        setMagicWand(prev => ({ ...prev, visible: false }));
    }
  };
  
  const handleRewrite = async (instruction: RewriteInstruction) => {
    setIsRewriting(true);
    setRewrittenText(null);
    try {
        const result = await rewriteText(magicWand.selectedText, instruction);
        setRewrittenText(result);
    } catch (err) {
        setRewrittenText(`Error rewriting text: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } 
    // Don't set isRewriting false here, let the modal handle it
  };

  const closeMagicWandModals = () => {
    setIsRewriting(false);
    setRewrittenText(null);
    setMagicWand({ visible: false, top: 0, left: 0, selectedText: '' });
  };

  const handleFetchTrends = useCallback(async () => {
    setIsFetchingTrends(true);
    setTrendsError(null);
    try {
        const result = await getTrendingTopics();
        setTrendingTopics(result);
    } catch (err) {
        setTrendsError(err instanceof Error ? err.message : "Could not fetch trends.");
    } finally {
        setIsFetchingTrends(false);
    }
  }, []);

  const handleUseTrend = (topic: string) => {
    setBlogTitle(topic);
    setActivePanels(prev => prev.includes('main') ? prev : [...prev, 'main']);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateCalendar = async (goal: string, month: string) => {
    setIsGeneratingCalendar(true);
    setCalendarError(null);
    try {
        const plan = await generateContentCalendar(goal, month, customerPersona, brandVoiceProfile);
        setCalendarPlan(plan.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } catch (err) {
        setCalendarError(err instanceof Error ? `Failed to generate calendar: ${err.message}` : 'An unknown error occurred.');
    } finally {
        setIsGeneratingCalendar(false);
    }
  };

  const handleSelectCalendarTopic = (topic: CalendarTopic) => {
    resetAll();
    setBlogTitle(topic.title);
    setSeoKeywords(topic.keywords);
    setContentTemplate(topic.contentType);
    setAppMode('blog');
    setView('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Auto-Pilot Logic ---
  const addAutopilotLog = useCallback((message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setAutopilotLog(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
  }, []);

  const stopAutopilot = useCallback(() => {
    if (autopilotIntervalRef.current) clearTimeout(autopilotIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    autopilotIntervalRef.current = null;
    countdownIntervalRef.current = null;
    setAutopilotStatus('idle');
    setAutopilotCurrentTask('');
    setAutopilotCountdown(0);
    setAutopilotPublishTrigger(null);
  }, []);

  const runAutopilotCycle = useCallback(async () => {
    const autopilotPrerequisites = {
      shopify: shopifyCreds.storeName && shopifyCreds.accessToken && shopifyBlogs.length > 0,
      brandVoice: !!brandVoiceProfile,
      persona: !!customerPersona
    };
    if (!autopilotPrerequisites.shopify || !autopilotPrerequisites.brandVoice || !autopilotPrerequisites.persona) {
      addAutopilotLog("❌ Error: Prerequisites not met. Pausing auto-pilot.");
      setIsAutopilotActive(false);
      stopAutopilot();
      return;
    }

    setAutopilotStatus('working');
    addAutopilotLog("🚀 Starting new cycle...");

    try {
      setAutopilotCurrentTask("Fetching trending topic...");
      const trends = await getTrendingTopics();
      if (!trends.topics || trends.topics.length === 0) throw new Error("Could not find any trending topics.");
      const topic = trends.topics[0];
      addAutopilotLog(`💡 Selected topic: "${topic.topic}"`);
      setBlogTitle(topic.topic);
      setSeoKeywords(''); 

      setAutopilotCurrentTask("Generating blog outline...");
      const generatedOutline = await generateBlogOutline(topic.topic, '', contentTemplate, authorPersona, brandVoiceProfile, customerPersona);
      addAutopilotLog("✅ Outline generated.");
      setOutline(generatedOutline);

      setAutopilotCurrentTask("Writing full article...");
      setContentBlocks([]); // Clear previous content before streaming
      const generatedBlocks = await handleGenerateFullArticle(generatedOutline);
      if (!generatedBlocks) throw new Error("Article generation failed to produce content.");
      addAutopilotLog("✅ Full article generated.");

      setAutopilotCurrentTask("Publishing to Shopify...");
      const blogToPublishTo = selectedShopifyBlog || (shopifyBlogs.length > 0 ? String(shopifyBlogs[0].id) : '');
      if (!blogToPublishTo) throw new Error("No Shopify blog is selected or available.");
      
      const blogId = parseInt(blogToPublishTo, 10);
      setAutopilotPublishTrigger({ blogId });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      addAutopilotLog(`❌ ERROR: ${errorMessage}`);
      setAutopilotStatus('error');
      setAutopilotCurrentTask(`Failed. Check log. Pausing.`);
      setIsAutopilotActive(false);
      stopAutopilot();
    }
  }, [addAutopilotLog, brandVoiceProfile, customerPersona, shopifyCreds, shopifyBlogs, handleGenerateFullArticle, stopAutopilot, contentTemplate, authorPersona, selectedShopifyBlog]);
  
  const startWaitTimer = useCallback(() => {
    const oneHour = 3600 * 1000;
    setAutopilotCountdown(oneHour);
    setAutopilotStatus('waiting');

    countdownIntervalRef.current = window.setInterval(() => {
        setAutopilotCountdown(prev => Math.max(0, prev - 1000));
    }, 1000);

    autopilotIntervalRef.current = window.setTimeout(() => {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        runAutopilotCycle();
    }, oneHour);
  }, [runAutopilotCycle]);

  useEffect(() => {
    if (!autopilotPublishTrigger) return;
    
    const publish = async () => {
        try {
            const { blogId } = autopilotPublishTrigger;
            let htmlContent = convertBlocksToHtml(contentBlocks, imageStates);
            
            const selectedMetaTitle = seoData?.metaTitles[0];
            const selectedMetaDescription = seoData?.metaDescriptions[0];

            if (seoData?.faq && seoData.faq.length > 0) {
                htmlContent += convertFaqToHtml(seoData.faq);
            }

            const result = await createArticle(shopifyCreds, blogId, htmlContent, selectedMetaTitle, selectedMetaDescription);
            addAutopilotLog(`✅ Successfully published to Shopify! Article ID: ${result.article.id}`);
            
            startWaitTimer();

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown publishing error occurred.';
            addAutopilotLog(`❌ PUBLISH ERROR: ${errorMessage}`);
            setAutopilotStatus('error');
            setAutopilotCurrentTask('Publishing failed. Pausing.');
            setIsAutopilotActive(false);
            stopAutopilot();
        } finally {
            setAutopilotPublishTrigger(null);
        }
    };

    publish();

  }, [autopilotPublishTrigger, contentBlocks, imageStates, seoData, shopifyCreds, addAutopilotLog, startWaitTimer, stopAutopilot]);
  
  const handleToggleAutopilot = (enabled: boolean) => {
    setIsAutopilotActive(enabled);
    if (enabled) {
      addAutopilotLog('Auto-pilot enabled. Starting first cycle.');
      runAutopilotCycle();
    } else {
      addAutopilotLog('Auto-pilot disabled by user.');
      stopAutopilot();
    }
  };

  const handleFetchSitemap = async () => {
    if (!sitemapUrl.trim()) return;
    setIsParsingSitemap(true);
    setSitemapError(null);
    try {
        const links = await fetchAndParseSitemap(sitemapUrl);
        setInternalLinks(links);
    } catch(err) {
        setSitemapError(err instanceof Error ? err.message : "An unknown error occurred while parsing the sitemap.");
    } finally {
        setIsParsingSitemap(false);
    }
  };


  const filteredHistory = useMemo(() => {
    if (!historySearchTerm.trim()) return history;
    const lowercasedFilter = historySearchTerm.toLowerCase();
    return history.filter(item => 
        item.title.toLowerCase().includes(lowercasedFilter) ||
        item.keywords.toLowerCase().includes(lowercasedFilter)
    );
  }, [history, historySearchTerm]);

  const faqHtml = useMemo(() => seoData?.faq ? convertFaqToHtml(seoData.faq) : '', [seoData]);
  const mainButtonDisabled = isGenerating || isGeneratingOutline || isAutopilotActive;

  const togglePanel = (panelId: string) => {
    setActivePanels(prev => 
      prev.includes(panelId) ? prev.filter(id => id !== panelId) : [...prev, panelId]
    );
  };
    
    return {
        view, setView,
        appMode, setAppMode,
        appState,
        blogTitle, setBlogTitle,
        campaignGoal, setCampaignGoal,
        seoKeywords, setSeoKeywords,
        tone, setTone,
        aspectRatio, setAspectRatio,
        referenceImage,
        contentTemplate, setContentTemplate,
        authorPersona, setAuthorPersona,
        imageStyle, setImageStyle,
        negativeImagePrompt, setNegativeImagePrompt,
        brandVoiceProfile,
        isBrandVoiceModalOpen, setIsBrandVoiceModalOpen,
        customerPersona,
        isPersonaModalOpen, setIsPersonaModalOpen,
        outline, setOutline,
        campaignPlan,
        contentBlocks,
        campaignAssets,
        imageStates,
        isGenerating,
        isGeneratingOutline,
        isRegeneratingSection,
        error,
        repurposedContent, setRepurposedContent,
        isRepurposing,
        calendarPlan,
        isGeneratingCalendar,
        calendarError,
        seoData,
        selectedTitleIndex, setSelectedTitleIndex,
        selectedDescriptionIndex, setSelectedDescriptionIndex,
        seoScore,
        isGeneratingSeo,
        isGeneratingSeoScore,
        seoError,
        competitorUrl, setCompetitorUrl,
        competitorAnalysis,
        isAnalyzingCompetitor,
        competitorError,
        trendingTopics,
        isFetchingTrends,
        trendsError,
        history,
        historySearchTerm, setHistorySearchTerm,
        isShopifyModalOpen, setIsShopifyModalOpen,
        shopifyCreds,
        shopifyBlogs,
        selectedShopifyBlog, setSelectedShopifyBlog,
        isPublishing,
        publishError,
        publishSuccess,
        isFetchingBlogs,
        activePanels,
        magicWand,
        isRewriting,
        rewrittenText,
        isAutopilotActive,
        autopilotStatus,
        autopilotCurrentTask,
        autopilotLog,
        autopilotCountdown,
        sitemapUrl, setSitemapUrl,
        internalLinks,
        isParsingSitemap,
        sitemapError,
        resetAll,
        handleGenerate,
        handleRegenerateSection,
        handleGenerateFullArticle,
        handleGenerateCampaign,
        handleHistoryClick,
        handleRetryImage,
        handleUpdateImagePrompt,
        handleDeleteHistory,
        handleSaveBrandVoice,
        handleSavePersona,
        handleRepurpose,
        handleSaveShopifyCreds,
        handlePublish,
        handleImageUpload,
        handleRemoveImage,
        handleAnalyzeCompetitor,
        handleAnalyzeSeoScore,
        handleTextSelection,
        handleRewrite,
        closeMagicWandModals,
        handleFetchTrends,
        handleUseTrend,
        handleGenerateCalendar,
        handleSelectCalendarTopic,
        handleToggleAutopilot,
        handleFetchSitemap,
        filteredHistory,
        faqHtml,
        mainButtonDisabled,
        togglePanel,
    }
}