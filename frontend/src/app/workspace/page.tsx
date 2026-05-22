'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GlassCard } from '@/components/GlassCard';
import { ParticleBg } from '@/components/ParticleBg';
import { LoadingScreen } from '@/components/LoadingScreen';
import { 
  Sparkles, 
  Cpu, 
  BookOpen, 
  Globe, 
  Upload, 
  Link2, 
  Volume2, 
  VolumeX, 
  Copy, 
  Bookmark, 
  Check, 
  FileText, 
  HelpCircle,
  BookmarkCheck,
  ChevronRight,
  BrainCircuit,
  CornerDownRight,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WorkspacePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, getAuthHeaders, apiUrl } = useAuth();

  // Navigation Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  // Loading and Error States
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [globalError, setGlobalError] = useState('');
  
  // Document Inputs
  const [activeInputTab, setActiveInputTab] = useState<'paste' | 'upload' | 'url'>('paste');
  const [pasteContent, setPasteContent] = useState('');
  const [pasteTitle, setPasteTitle] = useState('');
  const [urlLink, setUrlLink] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // AI Configurations
  const [simplifyMode, setSimplifyMode] = useState<'beginner' | 'student' | 'child' | 'bullets'>('student');
  const [targetLanguage, setTargetLanguage] = useState('en');

  // Loaded Work Result States
  const [articleId, setArticleId] = useState<string | null>(null);
  const [articleTitle, setArticleTitle] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [simplifiedText, setSimplifiedText] = useState('');
  const [keyTerms, setKeyTerms] = useState<Array<{ term: string; definition: string; analogy?: string }>>([]);
  const [explanationSteps, setExplanationSteps] = useState<string[]>([]);
  const [difficultyScore, setDifficultyScore] = useState<number | null>(null);
  const [summaryData, setSummaryData] = useState<{ briefSummary?: string; mainPoints?: string[]; realWorldApplications?: string[] } | null>(null);
  
  // Workspace Layout States
  const [activeOutputTab, setActiveOutputTab] = useState<'simplified' | 'glossary' | 'summary'>('simplified');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // HIGHLIGHT EXPLAINER TOOLTIP STATES
  const [selectionWord, setSelectionWord] = useState('');
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [tooltipLoading, setTooltipLoading] = useState(false);
  const [tooltipAnalogy, setTooltipAnalogy] = useState('');
  const simplifiedTextRef = useRef<HTMLDivElement>(null);

  // TEXT TO SPEECH STATES
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechVoice, setSpeechVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Fetch TTS available voices
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices.filter(v => v.lang.startsWith('en') || v.lang.startsWith(targetLanguage)));
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [targetLanguage]);

  // Check Bookmark status when Article ID changes
  useEffect(() => {
    if (!articleId) return;

    const checkBookmark = async () => {
      try {
        const response = await fetch(`${apiUrl}/bookmarks/status/${articleId}`, {
          headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
          setIsBookmarked(data.bookmarked);
        }
      } catch (err) {
        console.error('Failed to sync bookmark status', err);
      }
    };
    checkBookmark();
  }, [articleId, apiUrl, getAuthHeaders]);

  // Clean speaking on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Web Scraping action
  const handleScrapeUrl = async () => {
    if (!urlLink.trim()) return;
    setWorkspaceLoading(true);
    setLoadingMessage('Bypassing standard CORS walls and scraping URL text...');
    setGlobalError('');

    try {
      const response = await fetch(`${apiUrl}/parse/url`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ url: urlLink })
      });
      const data = await response.json();

      if (data.success) {
        setPasteTitle(data.title);
        setPasteContent(data.content);
        setActiveInputTab('paste'); // Load into paste box automatically
      } else {
        setGlobalError(data.message || 'Scraper failed to pull readable text.');
      }
    } catch (err) {
      setGlobalError('Connection to URL parse pipeline failed.');
    } finally {
      setWorkspaceLoading(false);
    }
  };

  // File parsing action
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setWorkspaceLoading(true);
    setLoadingMessage('Parsing document headers and extracting text buffers...');
    setGlobalError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${apiUrl}/parse/file`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeaders()['Authorization']
        },
        body: formData
      });
      const data = await response.json();

      if (data.success) {
        setPasteTitle(data.title);
        setPasteContent(data.content);
        setActiveInputTab('paste'); // Load into paste box
      } else {
        setGlobalError(data.message || 'Document parser failed to decode this format.');
      }
    } catch (err) {
      setGlobalError('Connection to document parser pipeline failed.');
    } finally {
      setWorkspaceLoading(false);
    }
  };

  // Core simplification pipeline
  const runSimplification = async () => {
    if (!pasteContent.trim()) {
      setGlobalError('Please paste, upload, or scrape some article text first.');
      return;
    }

    setWorkspaceLoading(true);
    setLoadingMessage('Analyzing academic complexity triggers...');
    setGlobalError('');
    
    // Clear old outputs
    setSimplifiedText('');
    setKeyTerms([]);
    setExplanationSteps([]);
    setDifficultyScore(null);
    setSummaryData(null);

    try {
      // 1. Simplify text API
      const simpRes = await fetch(`${apiUrl}/ai/simplify`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          text: pasteContent,
          title: pasteTitle || 'Direct paste',
          mode: simplifyMode,
          language: targetLanguage
        })
      });
      
      const simpData = await simpRes.json();
      if (!simpData.success) {
        throw new Error(simpData.message || 'Simplification run failed.');
      }

      setArticleId(simpData.articleId);
      setArticleTitle(pasteTitle || 'Direct paste');
      setOriginalText(pasteContent);
      setSimplifiedText(simpData.simplifiedText);
      setKeyTerms(simpData.keyTerms || []);
      setExplanationSteps(simpData.explanationSteps || []);
      setDifficultyScore(simpData.difficultyScore);

      // 2. Asynchronously load summary
      setLoadingMessage('Decompressing key takeaways & summary details...');
      const sumRes = await fetch(`${apiUrl}/ai/summary`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          articleId: simpData.articleId,
          text: pasteContent,
          title: pasteTitle || 'Direct paste'
        })
      });
      const sumData = await sumRes.json();
      if (sumData.success) {
        setSummaryData({
          briefSummary: sumData.briefSummary,
          mainPoints: sumData.mainPoints,
          realWorldApplications: sumData.realWorldApplications
        });
      }

      setActiveOutputTab('simplified');
    } catch (err: any) {
      setGlobalError(err.message || 'AI Engine connection timeout.');
    } finally {
      setWorkspaceLoading(false);
    }
  };

  // Highlight word selector explainer popup handler
  const handleTextHighlight = async (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (!selection) return;

    const selectedText = selection.toString().trim();
    
    // Clear previous if selection is empty or extremely long
    if (!selectedText || selectedText.split(/\s+/).length > 4) {
      setTooltipPos(null);
      setSelectionWord('');
      return;
    }

    // Set position of the popover dynamically
    const x = e.clientX;
    const y = e.clientY - 15; // Floating above
    
    setTooltipPos({ x, y });
    setSelectionWord(selectedText);
    setTooltipLoading(true);
    setTooltipAnalogy('');

    try {
      const response = await fetch(`${apiUrl}/ai/explain-concept`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          word: selectedText,
          contextSentence: selection.anchorNode?.parentElement?.innerText || ''
        })
      });
      const data = await response.json();

      if (data.success) {
        setTooltipAnalogy(data.explanation);
      } else {
        setTooltipAnalogy('Failed to generate context definition.');
      }
    } catch (err) {
      setTooltipAnalogy('Server connection error.');
    } finally {
      setTooltipLoading(false);
    }
  };

  // TTS audio synthesizers
  const toggleSpeechPlayback = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.pause();
      setIsSpeaking(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsSpeaking(true);
      } else {
        // Build new Utterance
        window.speechSynthesis.cancel();
        
        // Strip markdown before reading
        const plainText = simplifiedText.replace(/[#*`_-]/g, '');
        const utterance = new SpeechSynthesisUtterance(plainText);
        
        if (speechVoice) utterance.voice = speechVoice;
        utterance.rate = speechRate;
        
        utterance.onend = () => {
          setIsSpeaking(false);
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
        };

        speechUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  const stopSpeechPlayback = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Copy text clipboard utility
  const copyTextToClipboard = () => {
    navigator.clipboard.writeText(simplifiedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Add/Remove bookmark
  const toggleBookmarkArticle = async () => {
    if (!articleId) return;

    try {
      const response = await fetch(`${apiUrl}/bookmarks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: articleTitle,
          type: 'simplification',
          referenceId: articleId
        })
      });
      const data = await response.json();
      if (data.success) {
        setIsBookmarked(data.bookmarked);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
    }
  };

  if (authLoading) {
    return <LoadingScreen isLoading={true} message="Validating secure credentials..." />;
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden">
      <ParticleBg />
      <Header />

      {/* Main Workspace Frame */}
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 w-full">
        
        {/* Global Error Banner */}
        <AnimatePresence>
          {globalError && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl flex items-center space-x-2 text-sm"
            >
              <HelpCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{globalError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================== */}
          {/* LEFT COLUMN: CONTROL INPUT DOCK (5/12 grid) */}
          {/* ========================================== */}
          <div className="lg:col-span-5 space-y-6">
            <GlassCard className="p-6 border-white/10 shadow-glass">
              
              {/* Tab Header Inputs */}
              <div className="flex bg-slate-950/60 p-1.5 rounded-xl border border-white/5 mb-6">
                <button
                  onClick={() => setActiveInputTab('paste')}
                  className={`flex-1 py-2 text-xs font-bold tracking-wide rounded-lg transition-all ${
                    activeInputTab === 'paste' ? 'bg-white/5 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Paste Jargon
                </button>
                <button
                  onClick={() => setActiveInputTab('upload')}
                  className={`flex-1 py-2 text-xs font-bold tracking-wide rounded-lg transition-all ${
                    activeInputTab === 'upload' ? 'bg-white/5 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setActiveInputTab('url')}
                  className={`flex-1 py-2 text-xs font-bold tracking-wide rounded-lg transition-all ${
                    activeInputTab === 'url' ? 'bg-white/5 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Scrape Website
                </button>
              </div>

              {/* Paste Text Panel */}
              {activeInputTab === 'paste' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                      Article / Paper Title
                    </label>
                    <input
                      type="text"
                      value={pasteTitle}
                      onChange={(e) => setPasteTitle(e.target.value)}
                      className="glass-input px-4 py-2.5 rounded-xl w-full text-slate-200 placeholder-slate-600 text-xs"
                      placeholder="e.g. Epigenetic Effects of High-Density Training"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                      Source Text
                    </label>
                    <textarea
                      value={pasteContent}
                      onChange={(e) => setPasteContent(e.target.value)}
                      rows={10}
                      className="glass-input p-4 rounded-xl w-full text-slate-200 placeholder-slate-600 text-xs resize-none h-60 focus:outline-none"
                      placeholder="Paste scientific materials, legal drafts, textbooks or raw paragraphs here..."
                    />
                  </div>
                </div>
              )}

              {/* File Upload Panel */}
              {activeInputTab === 'upload' && (
                <div className="space-y-4 py-6 text-center">
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 hover:border-accent-purple/35 transition-colors cursor-pointer relative group">
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-10 h-10 text-slate-500 mx-auto group-hover:text-accent-purple transition-colors mb-3" />
                    <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wide font-space">
                      Drag & Drop Document
                    </h5>
                    <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                      Supports PDF, DOCX, and TXT files up to 10MB.<br />
                      Buffers automatically parse into the editor.
                    </p>
                  </div>
                </div>
              )}

              {/* Scrape URL Panel */}
              {activeInputTab === 'url' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                      Scrape Website Link
                    </label>
                    <div className="flex space-x-2">
                      <div className="relative flex-grow">
                        <Link2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                        <input
                          type="url"
                          value={urlLink}
                          onChange={(e) => setUrlLink(e.target.value)}
                          className="glass-input pl-10 pr-4 py-2.5 rounded-xl w-full text-slate-200 placeholder-slate-600 text-xs"
                          placeholder="https://en.wikipedia.org/wiki/Neuroscience"
                        />
                      </div>
                      <button
                        onClick={handleScrapeUrl}
                        className="px-4 rounded-xl bg-accent-blue/20 hover:bg-accent-blue/30 border border-accent-blue/35 text-white font-bold text-xs uppercase tracking-wider transition-all"
                      >
                        Scrape
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Global AI Selectors Panel */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
                
                {/* Level Mode Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    Readability Level
                  </label>
                  <select
                    value={simplifyMode}
                    onChange={(e: any) => setSimplifyMode(e.target.value)}
                    className="glass-input px-3 py-2 rounded-xl w-full text-slate-200 text-xs"
                  >
                    <option value="child">Child (ELI5)</option>
                    <option value="student">Student (Analogy)</option>
                    <option value="beginner">General Beginner</option>
                    <option value="bullets">Executive Bullets</option>
                  </select>
                </div>

                {/* Target Language Picker */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    Target Language
                  </label>
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="glass-input px-3 py-2 rounded-xl w-full text-slate-200 text-xs"
                  >
                    <option value="en">English (Default)</option>
                    <option value="es">Spanish (Español)</option>
                    <option value="fr">French (Français)</option>
                    <option value="de">German (Deutsch)</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="zh">Chinese (中文)</option>
                  </select>
                </div>

              </div>

              {/* Action simplify launcher */}
              <button
                onClick={runSimplification}
                disabled={workspaceLoading || !pasteContent.trim()}
                className={`w-full neon-button py-3.5 mt-6 rounded-xl text-white font-bold tracking-wider text-xs uppercase flex items-center justify-center space-x-2 ${
                  workspaceLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Decompress Jargon</span>
              </button>

            </GlassCard>
          </div>

          {/* ========================================== */}
          {/* RIGHT COLUMN: DISPLAY OUTPUT DOCK (7/12 grid) */}
          {/* ========================================== */}
          <div className="lg:col-span-7">
            
            {/* If loading is active */}
            {workspaceLoading ? (
              <GlassCard className="p-12 border-white/5 shadow-glass flex flex-col items-center justify-center text-center min-h-[480px]">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-accent-purple animate-spin" />
                  <BrainCircuit className="w-7 h-7 text-accent-purple absolute inset-0 m-auto animate-pulse" />
                </div>
                <h4 className="text-base font-bold text-white font-space uppercase tracking-wider animate-pulse">
                  Simplifier AI Running
                </h4>
                <p className="text-slate-400 mt-2 text-xs max-w-sm leading-relaxed">
                  {loadingMessage}
                </p>
              </GlassCard>
            ) : simplifiedText ? (
              
              /* Output results panel */
              <div className="space-y-6">
                
                {/* Result header controller bar */}
                <div className="flex items-center justify-between p-4 glass-panel rounded-2xl border-white/10">
                  <div className="flex space-x-1.5 items-center">
                    <BookOpen className="w-5 h-5 text-accent-purple" />
                    <span className="text-xs font-bold text-slate-200 tracking-wide font-space truncate max-w-[200px] md:max-w-xs">
                      {articleTitle}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    
                    {/* Difficulty badge */}
                    {difficultyScore && (
                      <span className="hidden md:inline-block px-2.5 py-1 rounded-full text-[10px] bg-red-500/15 text-red-400 border border-red-500/25 font-bold uppercase tracking-wider font-space">
                        Difficulty Index: {difficultyScore}%
                      </span>
                    )}

                    {/* Bookmark Toggle */}
                    <button
                      onClick={toggleBookmarkArticle}
                      className={`p-2 rounded-xl border border-transparent transition-all hover:bg-white/5 ${
                        isBookmarked ? 'text-yellow-400' : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title={isBookmarked ? 'Remove Bookmark' : 'Save Bookmark'}
                    >
                      {isBookmarked ? <BookmarkCheck className="w-4.5 h-4.5" /> : <Bookmark className="w-4.5 h-4.5" />}
                    </button>

                    {/* Clipboard copy */}
                    <button
                      onClick={copyTextToClipboard}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent transition-all"
                      title="Copy to clipboard"
                    >
                      {isCopied ? <Check className="w-4.5 h-4.5 text-accent-emerald" /> : <Copy className="w-4.5 h-4.5" />}
                    </button>

                  </div>
                </div>

                {/* Main Tabs Output */}
                <GlassCard className="border-white/10 shadow-glass overflow-hidden">
                  
                  {/* Tabs select panel */}
                  <div className="flex bg-slate-950/60 p-1 rounded-b-none border-b border-white/5">
                    <button
                      onClick={() => setActiveOutputTab('simplified')}
                      className={`flex-1 py-3 text-xs font-bold tracking-wide transition-all border-b-2 ${
                        activeOutputTab === 'simplified' 
                          ? 'border-accent-purple text-white' 
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Simplified
                    </button>
                    <button
                      onClick={() => {
                        setActiveOutputTab('glossary');
                        setTooltipPos(null);
                      }}
                      className={`flex-1 py-3 text-xs font-bold tracking-wide transition-all border-b-2 ${
                        activeOutputTab === 'glossary' 
                          ? 'border-accent-purple text-white' 
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Glossary ({keyTerms.length})
                    </button>
                    <button
                      onClick={() => {
                        setActiveOutputTab('summary');
                        setTooltipPos(null);
                      }}
                      className={`flex-1 py-3 text-xs font-bold tracking-wide transition-all border-b-2 ${
                        activeOutputTab === 'summary' 
                          ? 'border-accent-purple text-white' 
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Digest Summary
                    </button>
                  </div>

                  <div className="p-6 min-h-[350px] relative">
                    
                    {/* TAB 1: SIMPLIFIED TEXT CONTENT */}
                    {activeOutputTab === 'simplified' && (
                      <div className="space-y-6">
                        
                        {/* Interactive Voice Synthesis Audio Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white/5 rounded-xl border border-white/5 text-xs">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={toggleSpeechPlayback}
                              className="w-8 h-8 rounded-lg bg-accent-purple/20 border border-accent-purple/35 flex items-center justify-center text-accent-purple hover:bg-accent-purple/30 transition-all"
                            >
                              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                            <span className="font-semibold text-slate-300">
                              {isSpeaking ? 'Narrating Simplification...' : 'Text-to-Speech Ready'}
                            </span>
                          </div>

                          <div className="flex items-center space-x-3">
                            {/* Voice select */}
                            {availableVoices.length > 0 && (
                              <select
                                onChange={(e) => setSpeechVoice(availableVoices[parseInt(e.target.value)])}
                                className="bg-slate-950/80 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-slate-300 focus:outline-none"
                              >
                                {availableVoices.map((voice, idx) => (
                                  <option key={idx} value={idx}>{voice.name.split(' ')[0]} ({voice.lang})</option>
                                ))}
                              </select>
                            )}

                            {/* Speed Selector */}
                            <div className="flex items-center space-x-1 bg-slate-950/60 border border-white/5 p-1 rounded-lg">
                              <span className="text-[10px] text-slate-500 px-1">Speed</span>
                              {[0.8, 1, 1.2, 1.5].map((rate) => (
                                <button
                                  key={rate}
                                  onClick={() => {
                                    setSpeechRate(rate);
                                    if (isSpeaking) {
                                      // Restart with new rate
                                      stopSpeechPlayback();
                                      setTimeout(toggleSpeechPlayback, 100);
                                    }
                                  }}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    speechRate === rate ? 'bg-accent-purple text-white' : 'text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  {rate}x
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Text Selection Box Listener */}
                        <div
                          ref={simplifiedTextRef}
                          onMouseUp={handleTextHighlight}
                          className="text-slate-200 text-sm md:text-base leading-relaxed whitespace-pre-line select-text pr-2 max-h-[400px] overflow-y-auto"
                        >
                          {simplifiedText}
                        </div>

                        {/* Interactive Selection Explainer Popup Bubble */}
                        <AnimatePresence>
                          {tooltipPos && selectionWord && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              style={{ 
                                position: 'fixed',
                                left: `${tooltipPos.x}px`,
                                top: `${tooltipPos.y - 120}px`,
                                transform: 'translateX(-50%)',
                                zIndex: 100
                              }}
                              className="w-64 glass-panel-heavy p-4 rounded-xl border-accent-purple/40 shadow-glass-neon text-xs pointer-events-auto"
                            >
                              <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-white/5">
                                <span className="font-bold text-accent-purple uppercase tracking-wider font-space">
                                  ELI5 Analogy: {selectionWord}
                                </span>
                                <button
                                  onClick={() => setTooltipPos(null)}
                                  className="text-slate-500 hover:text-slate-300 text-xs"
                                >
                                  ✕
                                </button>
                              </div>

                              {tooltipLoading ? (
                                <div className="space-y-1.5 py-2 animate-pulse">
                                  <div className="h-3 bg-white/5 rounded w-full" />
                                  <div className="h-3 bg-white/5 rounded w-5/6" />
                                </div>
                              ) : (
                                <p className="text-slate-300 leading-normal whitespace-normal">
                                  {tooltipAnalogy}
                                </p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Explanation list step-by-step */}
                        {explanationSteps.length > 0 && (
                          <div className="mt-8 pt-6 border-t border-white/5">
                            <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4 flex items-center">
                              <Cpu className="w-4 h-4 text-accent-purple mr-1.5" />
                              Decompression Logic Tree
                            </h4>
                            <div className="space-y-3">
                              {explanationSteps.map((step, idx) => (
                                <div key={idx} className="flex space-x-2 text-xs text-slate-300 leading-relaxed items-start">
                                  <ChevronRight className="w-4 h-4 text-accent-purple mt-0.5 flex-shrink-0" />
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    )}

                    {/* TAB 2: INTERACTIVE GLOSSARY */}
                    {activeOutputTab === 'glossary' && (
                      <div className="space-y-6">
                        {keyTerms.length > 0 ? (
                          <div className="grid md:grid-cols-2 gap-4">
                            {keyTerms.map((termItem, idx) => (
                              <GlassCard key={idx} className="p-4 border-white/5 bg-slate-900/10">
                                <h5 className="font-bold text-accent-purple text-xs md:text-sm font-space">
                                  {termItem.term}
                                </h5>
                                <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
                                  {termItem.definition}
                                </p>
                                {termItem.analogy && (
                                  <div className="mt-3 pt-2.5 border-t border-white/5 text-[11px] text-slate-400 leading-relaxed flex items-start">
                                    <CornerDownRight className="w-3.5 h-3.5 text-accent-indigo mr-1.5 mt-0.5 flex-shrink-0" />
                                    <span>
                                      <strong className="text-accent-indigo font-space font-semibold uppercase">Analogy:</strong> {termItem.analogy}
                                    </span>
                                  </div>
                                )}
                              </GlassCard>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-slate-500">
                            <FileText className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                            <p className="text-xs uppercase tracking-wider font-space">No technical glossary cards extracted.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 3: EXECUTIVE DIGEST SUMMARY */}
                    {activeOutputTab === 'summary' && (
                      <div className="space-y-6">
                        {summaryData ? (
                          <div className="space-y-6">
                            
                            {/* Brief overview summary */}
                            <div>
                              <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">Brief Digest Overview</h4>
                              <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                                {summaryData.briefSummary}
                              </p>
                            </div>

                            {/* Bullet Points */}
                            {summaryData.mainPoints && summaryData.mainPoints.length > 0 && (
                              <div>
                                <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">Key Takeaway Core Pillars</h4>
                                <div className="space-y-2">
                                  {summaryData.mainPoints.map((point, idx) => (
                                    <div key={idx} className="flex space-x-2 text-xs text-slate-300 leading-relaxed items-start">
                                      <span className="w-1.5 h-1.5 rounded-full bg-accent-purple mt-2 flex-shrink-0" />
                                      <span>{point}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Real world Applications */}
                            {summaryData.realWorldApplications && summaryData.realWorldApplications.length > 0 && (
                              <div className="pt-4 border-t border-white/5">
                                <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">Real-World Case Analogies</h4>
                                <div className="space-y-2">
                                  {summaryData.realWorldApplications.map((app, idx) => (
                                    <div key={idx} className="flex space-x-2 text-xs text-slate-300 leading-relaxed items-start">
                                      <GraduationCap className="w-4 h-4 text-accent-blue mt-0.5 flex-shrink-0" />
                                      <span>{app}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Revision Synthesizer Launcher Banner */}
                            <div className="mt-8 p-5 bg-gradient-to-r from-accent-indigo/10 to-accent-purple/10 border border-accent-purple/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                              <div>
                                <h5 className="text-xs md:text-sm font-bold text-white font-space flex items-center">
                                  <Sparkles className="w-4.5 h-4.5 text-accent-pink mr-1.5 animate-pulse" />
                                  AI Revision Synthesizer Ready
                                </h5>
                                <p className="text-[10px] md:text-xs text-slate-400 mt-1 leading-normal">
                                  Generate 3D flipped flashcards and active quizzes to test learning parameters.
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setWorkspaceLoading(true);
                                  setLoadingMessage('Compiling revision flashcards and active quizzes...');
                                  
                                  // Directly post and compile study notes
                                  fetch(`${apiUrl}/ai/notes`, {
                                    method: 'POST',
                                    headers: getAuthHeaders(),
                                    body: JSON.stringify({
                                      articleId,
                                      text: originalText,
                                      title: articleTitle
                                    })
                                  })
                                    .then(r => r.json())
                                    .then(notesData => {
                                      setWorkspaceLoading(false);
                                      if (notesData.success) {
                                        router.push(`/notes/${articleId}`);
                                      } else {
                                        setGlobalError('Failed to synthesize interactive revision suite.');
                                      }
                                    })
                                    .catch(() => {
                                      setWorkspaceLoading(false);
                                      setGlobalError('Notes engine connection failed.');
                                    });
                                }}
                                className="px-5 py-2.5 rounded-xl bg-accent-purple text-white font-bold tracking-wide text-xs hover:scale-105 transition-transform flex items-center space-x-1.5 shrink-0"
                              >
                                <span>Compile Revision Suite</span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>

                          </div>
                        ) : (
                          <div className="text-center py-12 text-slate-500">
                            <FileText className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                            <p className="text-xs uppercase tracking-wider font-space">Digest Summarizer loading...</p>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                </GlassCard>
              </div>

            ) : (
              
              /* Default Welcome workspace instructions */
              <GlassCard className="p-8 border-white/5 shadow-glass flex flex-col justify-center items-center text-center min-h-[480px]">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent-indigo to-accent-purple flex items-center justify-center shadow-neon-glow mb-6">
                  <BrainCircuit className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold font-space text-white leading-tight">
                  Comprehension Central Studio
                </h3>
                <p className="text-slate-400 mt-3 text-xs md:text-sm max-w-md leading-relaxed">
                  Enter an article title and paste dense academic materials on the left dock. Or, upload PDFs and scrape URLs directly to initiate NLP decompression modules.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center">
                    <Check className="w-4 h-4 text-accent-emerald mr-1" />
                    ELI5 Explanation
                  </span>
                  <span className="flex items-center">
                    <Check className="w-4 h-4 text-accent-emerald mr-1" />
                    TTS Audits
                  </span>
                  <span className="flex items-center">
                    <Check className="w-4 h-4 text-accent-emerald mr-1" />
                    3D Flashcards
                  </span>
                </div>
              </GlassCard>

            )}

          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
