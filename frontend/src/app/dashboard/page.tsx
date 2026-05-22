'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GlassCard } from '@/components/GlassCard';
import { ParticleBg } from '@/components/ParticleBg';
import { LoadingScreen } from '@/components/LoadingScreen';
import { 
  Sparkles, 
  LayoutDashboard, 
  Hourglass, 
  Hash, 
  Bookmark, 
  Trash2, 
  BookOpen, 
  Calendar, 
  ChevronRight, 
  ArrowRight,
  TrendingUp,
  Brain,
  FileText,
  BookmarkCheck,
  Languages
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, getAuthHeaders, apiUrl, logout } = useAuth();

  // Navigation Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  // Loading States
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [bookmarksList, setBookmarksList] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Fetch all dashboard aggregations
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchDashboardData = async () => {
      try {
        setDashboardLoading(true);
        
        // 1. Fetch History List
        const histResponse = await fetch(`${apiUrl}/history/simplifications`, {
          headers: getAuthHeaders()
        });
        const histData = await histResponse.json();
        if (histData.success) {
          setHistoryList(histData.list || []);
        }

        // 2. Fetch Bookmarks
        const bookResponse = await fetch(`${apiUrl}/bookmarks`, {
          headers: getAuthHeaders()
        });
        const bookData = await bookResponse.json();
        if (bookData.success) {
          setBookmarksList(bookData.bookmarks || []);
        }

        // 3. Fetch Analytics
        const anaResponse = await fetch(`${apiUrl}/analytics`, {
          headers: getAuthHeaders()
        });
        const anaData = await anaResponse.json();
        if (anaData.success) {
          setAnalyticsData(anaData.analytics);
        }

      } catch (err) {
        console.error('Failed to compile dashboard metrics', err);
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, apiUrl, getAuthHeaders]);

  if (authLoading || (dashboardLoading && !analyticsData)) {
    return <LoadingScreen isLoading={true} message="Aggregating academic research data..." />;
  }

  // Pre-formatted Recharts timeline dataset
  const chartData = analyticsData?.dailyActivity?.map((day: any) => ({
    name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
    words: day.wordsCount,
    articles: day.articlesCount
  })) || [];

  // Mode distribution indices
  const totalModes = Object.values(analyticsData?.modeUsage || {}).reduce((a: any, b: any) => a + b, 0) as number || 1;
  const modePercentages = Object.entries(analyticsData?.modeUsage || {}).map(([key, val]) => ({
    mode: key === 'bullets' ? 'Executive' : key === 'student' ? 'Analogy' : key === 'child' ? 'ELI5' : 'General',
    count: val as number,
    percentage: Math.round(((val as number) / totalModes) * 100)
  }));

  // Direct workspace reload launcher
  const handleOpenWorkspaceItem = (historyItem: any) => {
    // Write temporary localStorage context to load workspace instantly
    localStorage.setItem('simplifier_autoload_title', historyItem.articleId?.title || 'Untitled');
    localStorage.setItem('simplifier_autoload_content', historyItem.simplifiedText || '');
    localStorage.setItem('simplifier_autoload_original', historyItem.articleId?.content || '');
    localStorage.setItem('simplifier_autoload_id', historyItem.articleId?._id || '');
    
    router.push('/workspace');
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden">
      <ParticleBg />
      <Header />

      {/* Main Dashboard Grid */}
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 w-full">
        
        {/* Core Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight font-space text-white flex items-center">
              <LayoutDashboard className="w-8 h-8 text-accent-purple mr-2" />
              Activity Command Center
            </h1>
            <p className="text-slate-400 mt-1.5 text-xs md:text-sm">
              Overview of your reading stats, compressed jargon volumes, and persistent bookmarks.
            </p>
          </div>
          
          <button
            onClick={() => router.push('/workspace')}
            className="neon-button px-5 py-3 rounded-xl font-bold tracking-wide text-white text-xs uppercase flex items-center justify-center space-x-1.5 self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Workspace Studio</span>
          </button>
        </div>

        {/* METRICS NUMERICAL PANEL GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Card 1 */}
          <GlassCard className="p-5 border-white/5 bg-slate-900/10 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue">
              <Hash className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Words Processed
              </span>
              <h3 className="text-2xl font-extrabold text-white font-space mt-0.5">
                {analyticsData?.totalWordsSimplified?.toLocaleString() || 0}
              </h3>
            </div>
          </GlassCard>

          {/* Card 2 */}
          <GlassCard className="p-5 border-white/5 bg-slate-900/10 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple">
              <Hourglass className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Estimated Time Saved
              </span>
              <h3 className="text-2xl font-extrabold text-white font-space mt-0.5">
                {analyticsData?.timeSavedMinutes || 0} mins
              </h3>
            </div>
          </GlassCard>

          {/* Card 3 */}
          <GlassCard className="p-5 border-white/5 bg-slate-900/10 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-accent-pink/10 border border-accent-pink/20 flex items-center justify-center text-accent-pink">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Simplifications Logged
              </span>
              <h3 className="text-2xl font-extrabold text-white font-space mt-0.5">
                {historyList.length} articles
              </h3>
            </div>
          </GlassCard>

          {/* Card 4 */}
          <GlassCard className="p-5 border-white/5 bg-slate-900/10 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
              <BookmarkCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Saved Bookmarks
              </span>
              <h3 className="text-2xl font-extrabold text-white font-space mt-0.5">
                {bookmarksList.length} articles
              </h3>
            </div>
          </GlassCard>

        </div>

        {/* RECHARTS TIMELINE + COMPREHENSION PREFERENCE GRID */}
        <div className="grid lg:grid-cols-12 gap-8 mb-8">
          
          {/* Timeline Chart (8/12 grid) */}
          <div className="lg:col-span-8">
            <GlassCard className="p-6 border-white/5 bg-slate-900/5 min-h-[350px] flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold font-space text-white flex items-center">
                  <TrendingUp className="w-5 h-5 text-accent-blue mr-1.5" />
                  Decompression Volumetrics
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Timeline depicting number of complex words simplified during recent active sessions.
                </p>
              </div>

              <div className="h-64 w-full mt-6 text-xs select-none">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                      <YAxis stroke="#64748b" tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(10, 15, 30, 0.95)', 
                          borderColor: 'rgba(139, 92, 246, 0.3)',
                          borderRadius: '12px',
                          color: '#fff' 
                        }} 
                      />
                      <Area type="monotone" dataKey="words" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorWords)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col justify-center items-center h-full text-slate-500">
                    <Brain className="w-12 h-12 text-slate-700 animate-bounce mb-2" />
                    <p className="text-[10px] uppercase font-space">No daily chart history found</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Mode preference stats (4/12 grid) */}
          <div className="lg:col-span-4">
            <GlassCard className="p-6 border-white/5 bg-slate-900/5 min-h-[350px] flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold font-space text-white flex items-center">
                  <Brain className="w-5 h-5 text-accent-pink mr-1.5" />
                  Readability Indexes
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Distribution of readability modes processed by your study profile.
                </p>
              </div>

              <div className="space-y-4 my-6">
                {modePercentages.length > 0 ? (
                  modePercentages.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-bold text-slate-300 font-space">{item.mode} Mode</span>
                        <span className="text-slate-400 font-semibold">{item.percentage}% ({item.count})</span>
                      </div>
                      <div className="w-full bg-slate-950/80 rounded-full h-2 border border-white/5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-accent-indigo to-accent-purple h-full rounded-full transition-all duration-500" 
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <p className="text-[10px] uppercase font-space">No mode indices processed yet</p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] text-slate-400 leading-normal flex items-start">
                <Sparkles className="w-3.5 h-3.5 text-accent-purple mr-1.5 mt-0.5 shrink-0" />
                <span>
                  Study tip: Utilize <strong>ELI5 Mode</strong> for dense conceptual frameworks and <strong>Bullets</strong> for rapid reference sweeps.
                </span>
              </div>
            </GlassCard>
          </div>

        </div>

        {/* BOTTOM SECTION: HISTORY LISTING & BOOKMARKS DRAWER */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* History log timeline (8/12 grid) */}
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-lg font-bold font-space text-white flex items-center">
              <Calendar className="w-5 h-5 text-accent-purple mr-1.5" />
              Simplification Chronicles
            </h3>

            {historyList.length > 0 ? (
              <div className="space-y-4">
                {historyList.map((item, idx) => (
                  <GlassCard
                    key={idx}
                    className="p-5 border-white/5 bg-slate-900/5 hover:border-white/10 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-white font-space truncate max-w-[250px] md:max-w-xs">
                          {item.articleId?.title || 'Untitled'}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[9px] bg-accent-purple/20 text-accent-purple border border-accent-purple/35 font-bold uppercase tracking-wider font-space shrink-0">
                          {item.mode === 'bullets' ? 'Executive' : item.mode === 'student' ? 'Analogy' : item.mode === 'child' ? 'ELI5' : 'General'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-[10px] text-slate-500">
                        <span className="flex items-center">
                          <FileText className="w-3.5 h-3.5 mr-1" />
                          Source: {item.articleId?.source || 'Direct paste'}
                        </span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 self-end md:self-auto">
                      
                      {/* Compile/Access Study Deck */}
                      <button
                        onClick={() => router.push(`/notes/${item.articleId?._id}`)}
                        className="px-3.5 py-1.5 rounded-lg border border-accent-pink/30 bg-accent-pink/5 hover:bg-accent-pink/15 text-accent-pink font-bold text-[10px] uppercase tracking-wide transition-all"
                      >
                        Revision Deck
                      </button>

                      {/* Open workspace */}
                      <button
                        onClick={() => handleOpenWorkspaceItem(item)}
                        className="px-3.5 py-1.5 rounded-lg border border-accent-blue/30 bg-accent-blue/5 hover:bg-accent-blue/15 text-accent-blue font-bold text-[10px] uppercase tracking-wide transition-all flex items-center"
                      >
                        Workspace
                        <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>

                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard className="p-12 border-white/5 bg-slate-900/5 text-center text-slate-500 py-16">
                <FileText className="w-12 h-12 text-slate-700 mx-auto mb-2" />
                <p className="text-xs uppercase tracking-wider font-space">Your simplification logs are clear.</p>
                <button
                  onClick={() => router.push('/workspace')}
                  className="mt-4 px-4 py-2 rounded-xl bg-accent-purple text-white text-xs font-bold font-space uppercase"
                >
                  Simplify Your First Article
                </button>
              </GlassCard>
            )}
          </div>

          {/* Bookmarks Drawer (4/12 grid) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-lg font-bold font-space text-white flex items-center">
              <Bookmark className="w-5 h-5 text-accent-pink mr-1.5" />
              Digest Bookmarks
            </h3>

            {bookmarksList.length > 0 ? (
              <GlassCard className="p-4 border-white/5 bg-slate-900/5 space-y-3">
                {bookmarksList.map((book, idx) => (
                  <div 
                    key={idx}
                    className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="truncate pr-1">
                      <span className="font-semibold text-slate-200 block truncate font-space hover:text-accent-purple cursor-pointer transition-colors"
                        onClick={() => router.push(`/workspace`)} // Clicking navigates back to explore
                      >
                        {book.title}
                      </span>
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5 block">
                        Saved: {new Date(book.createdAt).toLocaleDateString('en-US', { dateStyle: 'short' })}
                      </span>
                    </div>

                    <button
                      onClick={() => router.push(`/notes/${book.referenceId}`)}
                      className="p-1.5 rounded-lg bg-accent-pink/10 hover:bg-accent-pink/20 text-accent-pink border border-accent-pink/15 transition-all shrink-0"
                      title="Generate revision notes"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </GlassCard>
            ) : (
              <GlassCard className="p-8 border-white/5 bg-slate-900/5 text-center text-slate-500 py-16">
                <Bookmark className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                <p className="text-xs uppercase tracking-wider font-space">No articles bookmarked.</p>
              </GlassCard>
            )}
          </div>

        </div>

      </div>

      <Footer />
    </div>
  );
}
