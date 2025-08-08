
import React, { useId, useMemo } from 'react';

import { useAppLogic } from './hooks/useAppLogic';
import {
    TONES,
    ASPECT_RATIOS,
    CONTENT_TEMPLATES,
    AUTHOR_PERSONAS,
    IMAGE_STYLES,
} from './types';

import { 
  analyzeBrandVoice,
  analyzeBrandVoiceFromUrl,
  generateCustomerPersona,
} from './services/gemini';
import { ShopifyCredentials } from './services/shopifyService';

import Header from './components/Header';
import { BlogPostDisplay } from './components/BlogPostDisplay';
import { SparkleIcon } from './components/icons/SparkleIcon';
import { TrashIcon } from './components/icons/TrashIcon';
import ShopifyModal from './components/ShopifyModal';
import { ShopifyIcon } from './components/icons/ShopifyIcon';
import { UploadIcon } from './components/icons/UploadIcon';
import { XCircleIcon } from './components/icons/XCircleIcon';
import { SeoDisplay } from './components/SeoDisplay';
import { BrainCircuitIcon } from './components/icons/BrainCircuitIcon';
import { SitemapIcon } from './components/icons/SitemapIcon';
import BrandVoiceModal from './components/BrandVoiceModal';
import OutlineEditor from './components/OutlineEditor';
import RepurposePanel from './components/RepurposePanel';
import CampaignPlanner from './components/CampaignPlanner';
import { MegaphoneIcon } from './components/icons/MegaphoneIcon';
import CampaignDisplay from './components/CampaignDisplay';
import { SearchIcon } from './components/icons/SearchIcon';
import { GaugeIcon } from './components/icons/GaugeIcon';
import CompetitorAnalyzer from './components/CompetitorAnalyzer';
import SeoScoreDisplay from './components/SeoScoreDisplay';
import MagicWandMenu, { RewriteInstruction } from './components/MagicWandMenu';
import { TrendingUpIcon } from './components/icons/TrendingUpIcon';
import TrendSpotter from './components/TrendSpotter';
import PersonaGenerator from './components/PersonaGenerator';
import { UsersIcon } from './components/icons/UsersIcon';
import Dashboard from './components/Dashboard';
import { LayoutDashboardIcon } from './components/icons/LayoutDashboardIcon';
import { PilotIcon } from './components/icons/PilotIcon';
import AutoPilotPanel from './components/AutoPilotPanel';


const App: React.FC = () => {
  const formId = useId();
  const {
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
      resetAll,
      handleGenerateOutline,
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
      filteredHistory,
      faqHtml,
      mainButtonDisabled,
      togglePanel,
  } = useAppLogic();

  const SidebarPanel: React.FC<{id: string, title: string, icon: React.ReactNode, children: React.ReactNode}> = ({id, title, icon, children}) => {
    const isOpen = activePanels.includes(id);
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <button onClick={() => togglePanel(id)} className="w-full flex justify-between items-center p-4 text-left">
                <h3 className="text-lg font-serif font-bold text-[#C57F5D] flex items-center gap-3">{icon}{title}</h3>
                 <svg className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && <div className="p-4 pt-0">{children}</div>}
        </div>
    )
  };

  if (view === 'dashboard') {
    return (
        <div className="min-h-screen bg-[#FFFBF5] text-[#3D2C21]">
            <Header />
            <Dashboard
                onSelectTopic={handleSelectCalendarTopic}
                onGoToGenerator={() => {
                    resetAll();
                    setView('generator');
                }}
                onGenerateCalendar={handleGenerateCalendar}
                plan={calendarPlan}
                isLoading={isGeneratingCalendar}
                error={calendarError}
            />
            <footer className="text-center py-6 text-gray-500 text-sm">
                <p>Crafted with ❤️ for Chamkili</p>
            </footer>
        </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#FFFBF5] text-[#3D2C21]">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold font-serif text-[#C57F5D] mb-2">AI Content Strategist</h1>
              </div>

                <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                    <button onClick={() => { setAppMode('blog'); resetAll(); }} className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${appMode === 'blog' ? 'bg-white shadow text-[#C57F5D]' : 'text-gray-600 hover:bg-gray-200'}`}>Blog Post</button>
                    <button onClick={() => { setAppMode('campaign'); resetAll(); }} className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${appMode === 'campaign' ? 'bg-white shadow text-[#C57F5D]' : 'text-gray-600 hover:bg-gray-200'}`}>Marketing Campaign</button>
                </div>

              <div className="space-y-4">
                {appMode === 'blog' ? (
                  <div>
                    <label htmlFor={`${formId}-blogTitle`} className="block text-sm font-medium text-gray-700 mb-1">Blog Title</label>
                    <input type="text" id={`${formId}-blogTitle`} value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="e.g., How to get rid of acne scars" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C57F5D] focus:border-[#C57F5D] transition-shadow duration-200" disabled={mainButtonDisabled} />
                  </div>
                ) : (
                   <div>
                    <label htmlFor={`${formId}-campaignGoal`} className="block text-sm font-medium text-gray-700 mb-1">Campaign Goal</label>
                    <textarea id={`${formId}-campaignGoal`} rows={3} value={campaignGoal} onChange={(e) => setCampaignGoal(e.target.value)} placeholder="e.g., Launch our new Retinol Night Cream to existing customers." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C57F5D] focus:border-[#C57F5D] transition-shadow duration-200" disabled={mainButtonDisabled} />
                  </div>
                )}
                 
                <button onClick={handleGenerateOutline} disabled={mainButtonDisabled || (appMode === 'campaign' && !campaignGoal.trim())} className="w-full flex items-center justify-center gap-2 bg-[#D18F70] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#C57F5D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C57F5D] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02]">
                  {isGeneratingOutline ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Creating Plan...</>) 
                  : (<>{appMode === 'blog' ? <SitemapIcon className="w-5 h-5" /> : <MegaphoneIcon className="w-5 h-5"/>}Generate Plan</>)}
                </button>
              </div>
            </div>

            <SidebarPanel id="autopilot" title="Auto-Pilot Mode" icon={<PilotIcon className="w-6 h-6"/>}>
                <AutoPilotPanel 
                    isActive={isAutopilotActive}
                    onToggle={handleToggleAutopilot}
                    status={autopilotStatus}
                    currentTask={autopilotCurrentTask}
                    countdown={autopilotCountdown}
                    log={autopilotLog}
                    prerequisites={{
                         shopify: shopifyCreds.storeName && shopifyCreds.accessToken && shopifyBlogs.length > 0,
                         brandVoice: !!brandVoiceProfile,
                         persona: !!customerPersona,
                    }}
                />
            </SidebarPanel>
            
            <SidebarPanel id="creative" title="Creative Controls" icon={<SparkleIcon className="w-6 h-6"/>}>
               <div className="space-y-4">
                  {appMode === 'blog' && (
                    <>
                    <div>
                      <label htmlFor={`${formId}-keywords`} className="block text-sm font-medium text-gray-700 mb-1">Target SEO Keywords</label>
                      <input type="text" id={`${formId}-keywords`} value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="e.g., glowing skin, clear skin, pakistan" className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={mainButtonDisabled} />
                    </div>
                    <div>
                        <label htmlFor={`${formId}-tone`} className="block text-sm font-medium text-gray-700 mb-1">Tone of Voice</label>
                        <select id={`${formId}-tone`} value={tone} onChange={(e) => setTone(e.target.value)} disabled={mainButtonDisabled} className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em'}}>
                            {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor={`${formId}-contentTemplate`} className="block text-sm font-medium text-gray-700 mb-1">Content Template</label>
                        <select id={`${formId}-contentTemplate`} value={contentTemplate} onChange={(e) => setContentTemplate(e.target.value)} disabled={mainButtonDisabled} className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em'}}>
                            {CONTENT_TEMPLATES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor={`${formId}-authorPersona`} className="block text-sm font-medium text-gray-700 mb-1">Author Persona</label>
                        <select id={`${formId}-authorPersona`} value={authorPersona} onChange={(e) => setAuthorPersona(e.target.value)} disabled={mainButtonDisabled} className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em'}}>
                            {AUTHOR_PERSONAS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    </>
                  )}
                     <div>
                        <button onClick={() => setIsBrandVoiceModalOpen(true)} className="w-full flex items-center justify-center gap-2 text-sm text-[#C57F5D] font-semibold hover:underline mt-2">
                            <BrainCircuitIcon className="w-5 h-5" />
                            {brandVoiceProfile ? 'Edit Brand Voice Profile' : 'Set Brand Voice Profile'}
                        </button>
                    </div>
                </div>
            </SidebarPanel>

             <SidebarPanel id="persona" title="Audience Persona" icon={<UsersIcon className="w-6 h-6"/>}>
                {customerPersona ? (
                    <div className="space-y-3">
                        <div className="text-center">
                            <p className="font-bold text-lg text-gray-800">{customerPersona.name}, {customerPersona.age}</p>
                            <p className="text-sm text-gray-500">{customerPersona.occupation} from {customerPersona.location}</p>
                        </div>
                        <p className="text-xs bg-gray-50 p-2 rounded-md border text-gray-600">
                           "{customerPersona.bio}"
                        </p>
                        <button onClick={() => setIsPersonaModalOpen(true)} className="w-full text-center text-sm text-[#C57F5D] font-semibold hover:underline">
                            Edit or Change Persona
                        </button>
                    </div>
                ) : (
                    <div className="text-center space-y-3">
                        <p className="text-sm text-gray-600">No persona set. Content will target a general audience.</p>
                        <button onClick={() => setIsPersonaModalOpen(true)} className="w-full flex items-center justify-center gap-2 text-sm text-white bg-[#D18F70] hover:bg-[#C57F5D] font-semibold py-2 rounded-lg">
                            <UsersIcon className="w-5 h-5" />
                            Generate Persona
                        </button>
                    </div>
                )}
             </SidebarPanel>
            
             <SidebarPanel id="image" title="Image Controls" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label htmlFor={`${formId}-imageStyle`} className="block text-sm font-medium text-gray-700 mb-1">Visual Style</label>
                          <select id={`${formId}-imageStyle`} value={imageStyle} onChange={(e) => setImageStyle(e.target.value)} disabled={mainButtonDisabled} className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em'}}>
                              {IMAGE_STYLES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                      </div>
                      <div>
                          <label htmlFor={`${formId}-aspectRatio`} className="block text-sm font-medium text-gray-700 mb-1">Aspect Ratio</label>
                          <select id={`${formId}-aspectRatio`} value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} disabled={mainButtonDisabled} className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em'}}>
                              {Object.entries(ASPECT_RATIOS).map(([name, value]) => <option key={value} value={value}>{name}</option>)}
                          </select>
                      </div>
                  </div>
                  <div>
                    <label htmlFor={`${formId}-negativePrompt`} className="block text-sm font-medium text-gray-700 mb-1">Negative Prompt (Optional)</label>
                    <input type="text" id={`${formId}-negativePrompt`} value={negativeImagePrompt} onChange={(e) => setNegativeImagePrompt(e.target.value)} placeholder="e.g., text, blurry, cartoon" className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={mainButtonDisabled} />
                  </div>
                   <div className="pt-2">
                      <h4 className="block text-sm font-medium text-gray-700 mb-1">Reference Image (Optional)</h4>
                      {referenceImage ? (
                        <div className="relative">
                          <img src={referenceImage.preview} alt="Reference preview" className="w-full rounded-lg object-cover h-40" />
                          <button onClick={handleRemoveImage} disabled={mainButtonDisabled} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-gray-500 hover:text-red-600 hover:scale-110 transition-all duration-200 disabled:opacity-50" aria-label="Remove reference image">
                            <XCircleIcon className="w-6 h-6" />
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadIcon className="w-8 h-8 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                            <p className="text-xs text-gray-500">PNG, JPG, or WEBP</p>
                          </div>
                          <input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} disabled={mainButtonDisabled} />
                        </label>
                      )}
                  </div>
                </div>
            </SidebarPanel>
            
             <SidebarPanel id="trends" title="Trend Spotter" icon={<TrendingUpIcon className="w-6 h-6"/>}>
                <TrendSpotter
                    onFetch={handleFetchTrends}
                    isLoading={isFetchingTrends}
                    error={trendsError}
                    result={trendingTopics}
                    onUseTopic={handleUseTrend}
                />
            </SidebarPanel>
            
            <SidebarPanel id="competitor" title="Competitor Analysis" icon={<SearchIcon className="w-6 h-6"/>}>
                <CompetitorAnalyzer 
                    url={competitorUrl}
                    setUrl={setCompetitorUrl}
                    analysis={competitorAnalysis}
                    isLoading={isAnalyzingCompetitor}
                    error={competitorError}
                    onAnalyze={handleAnalyzeCompetitor}
                />
            </SidebarPanel>

             <SidebarPanel id="seoScore" title="SEO Score" icon={<GaugeIcon className="w-6 h-6"/>}>
                <SeoScoreDisplay
                    scoreData={seoScore}
                    isLoading={isGeneratingSeoScore}
                    onAnalyze={handleAnalyzeSeoScore}
                    disabled={appState !== 'generated' || contentBlocks.length === 0}
                />
            </SidebarPanel>

            {history.length > 0 && appMode === 'blog' && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-serif font-bold text-[#C57F5D] mb-4">Content Library</h2>
                 <div className="mb-4">
                    <input
                        type="search"
                        value={historySearchTerm}
                        onChange={e => setHistorySearchTerm(e.target.value)}
                        placeholder="Search by title or keywords..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C57F5D]"
                    />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {filteredHistory.map((item) => (
                    <div key={item.id} className="group flex items-center justify-between p-3 bg-gray-50 hover:bg-[#FFFBF5] rounded-lg transition-colors border border-transparent hover:border-gray-200">
                      <button onClick={() => handleHistoryClick(item)} className="text-left flex-1 truncate mr-2" title={item.title}>
                        <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                        <p className="text-xs text-gray-500 truncate">{item.keywords || 'No keywords'}</p>
                      </button>
                      <button onClick={() => handleDeleteHistory(item.id)} className="p-1.5 rounded-md text-gray-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete history item">
                          <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <button
                onClick={() => setView('dashboard')}
                className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#C57F5D] transition-colors"
            >
                <LayoutDashboardIcon className="w-5 h-5" />
                Back to Dashboard
            </button>
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
                <p><span className="font-bold">Error:</span> {error}</p>
              </div>
            )}
            
            {(appState === 'ideation' && !isAutopilotActive) && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 min-h-[60vh] flex items-center justify-center text-center text-gray-400 p-8">
                  <div>
                    <div className="w-24 h-24 text-[#C57F5D] mx-auto mb-4 opacity-30">
                        {appMode === 'blog' ? <SitemapIcon/> : <MegaphoneIcon/>}
                    </div>
                    <p className="font-medium text-lg">Your generated content will appear here.</p>
                    <p className="text-sm">Start by entering a {appMode === 'blog' ? 'title' : 'goal'} and clicking "Generate Plan".</p>
                  </div>
                </div>
            )}
            
            {isAutopilotActive && contentBlocks.length === 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 min-h-[60vh] flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <div className="w-16 h-16 border-4 border-[#C57F5D] border-dashed rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="font-medium text-lg">Auto-Pilot is warming up...</p>
                        <p className="text-sm">{autopilotCurrentTask}</p>
                    </div>
                </div>
            )}


            {appState === 'outline' && outline && (
                <OutlineEditor 
                    outline={outline}
                    setOutline={setOutline}
                    onApprove={handleGenerateFullArticle}
                    onCancel={resetAll}
                    isGenerating={isGenerating}
                    onRegenerateSection={handleRegenerateSection}
                    isRegeneratingSectionId={isRegeneratingSection}
                />
            )}
            
            {appState === 'campaign_plan' && campaignPlan && (
                <CampaignPlanner
                    plan={campaignPlan}
                    onApprove={handleGenerateCampaign}
                    onCancel={resetAll}
                    isGenerating={isGenerating}
                />
            )}
            
            {((appState === 'generated' && contentBlocks.length > 0) || (isAutopilotActive && contentBlocks.length > 0)) && (
              <>
                 {appMode === 'blog' ? (
                     <div onMouseUp={handleTextSelection} className="bg-white rounded-2xl shadow-lg border border-gray-200 min-h-[60vh]">
                        <BlogPostDisplay
                            blocks={contentBlocks}
                            imageStates={imageStates}
                            isLoading={isGenerating || (isAutopilotActive && autopilotStatus === 'working')}
                            onRetryImage={handleRetryImage}
                            onUpdateImagePrompt={handleUpdateImagePrompt}
                        />
                     </div>
                 ) : (
                    <CampaignDisplay 
                        blogPost={{blocks: contentBlocks, imageStates}}
                        campaignAssets={campaignAssets}
                        isLoading={isGenerating && !campaignAssets}
                        onRetryImage={handleRetryImage}
                        onUpdateImagePrompt={handleUpdateImagePrompt}
                    />
                 )}
              
                {appMode === 'blog' && (
                  <>
                    <RepurposePanel 
                      onRepurpose={handleRepurpose}
                      isRepurposing={isRepurposing}
                      result={repurposedContent}
                      onClear={() => setRepurposedContent(null)}
                    />

                    <SeoDisplay
                      isLoading={isGeneratingSeo}
                      seoData={seoData}
                      error={seoError}
                      selectedTitleIndex={selectedTitleIndex}
                      onSelectTitleIndex={setSelectedTitleIndex}
                      selectedDescriptionIndex={selectedDescriptionIndex}
                      onSelectDescriptionIndex={setSelectedDescriptionIndex}
                      faqHtml={faqHtml}
                    />
                    
                    <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                      <h3 className="text-xl font-serif font-bold text-[#C57F5D] mb-4 flex items-center gap-3">
                        <ShopifyIcon className="w-6 h-6"/> Publish to Shopify
                      </h3>
                      {shopifyCreds.storeName && shopifyCreds.accessToken ? (
                        <div className="space-y-4">
                          {isFetchingBlogs ? ( <p className="text-sm text-gray-500">Fetching blogs...</p> ) 
                          : shopifyBlogs.length > 0 ? (
                            <div>
                              <label htmlFor="shopifyBlogSelect" className="block text-sm font-medium text-gray-700 mb-1">Select Blog</label>
                              <select id="shopifyBlogSelect" value={selectedShopifyBlog} onChange={(e) => setSelectedShopifyBlog(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isPublishing}>
                                {shopifyBlogs.map(blog => <option key={blog.id} value={blog.id}>{blog.title}</option>)}
                              </select>
                            </div>
                          ) : ( <p className="text-sm text-gray-500">No blogs found.</p> )}
                          
                          <button onClick={handlePublish} disabled={isPublishing || isFetchingBlogs || shopifyBlogs.length === 0 || isAutopilotActive} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                            {isPublishing ? 'Publishing...' : 'Publish Article'}
                          </button>
                          <button onClick={() => setIsShopifyModalOpen(true)} className="w-full text-center text-sm text-gray-500 hover:text-[#C57F5D] mt-2">
                            Change Shopify Settings
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-600 mb-4 text-sm">Connect your Shopify store to publish directly.</p>
                          <button onClick={() => setIsShopifyModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-[#D18F70] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#C57F5D]">
                            <ShopifyIcon className="w-5 h-5" /> Configure Shopify
                          </button>
                        </div>
                      )}
                      {publishError && <p className="mt-4 text-sm text-red-600">{publishError}</p>}
                      {publishSuccess && <p className="mt-4 text-sm text-green-600">{publishSuccess}</p>}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      
      <MagicWandMenu
        state={magicWand}
        onClose={closeMagicWandModals}
        onRewrite={handleRewrite}
        isRewriting={isRewriting}
        rewrittenText={rewrittenText}
      />
      
      <BrandVoiceModal
        isOpen={isBrandVoiceModalOpen}
        onClose={() => setIsBrandVoiceModalOpen(false)}
        onSave={handleSaveBrandVoice}
        currentProfile={brandVoiceProfile}
        analyzeFunc={analyzeBrandVoice}
        analyzeUrlFunc={analyzeBrandVoiceFromUrl}
      />

       <PersonaGenerator
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        onSave={handleSavePersona}
        currentPersona={customerPersona}
        generateFunc={generateCustomerPersona}
      />

      <ShopifyModal 
        isOpen={isShopifyModalOpen}
        onClose={() => setIsShopifyModalOpen(false)}
        onSave={handleSaveShopifyCreds}
        initialStoreName={shopifyCreds.storeName}
        initialAccessToken={shopifyCreds.accessToken}
      />
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Crafted with ❤️ for Chamkili</p>
      </footer>
    </div>
  );
};

export default App;
