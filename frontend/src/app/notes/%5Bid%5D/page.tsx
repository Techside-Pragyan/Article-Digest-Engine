'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GlassCard } from '@/components/GlassCard';
import { ParticleBg } from '@/components/ParticleBg';
import { LoadingScreen } from '@/components/LoadingScreen';
import { 
  Sparkles, 
  HelpCircle, 
  ArrowLeft, 
  ChevronRight, 
  ChevronLeft, 
  RefreshCw, 
  Check, 
  X, 
  BookOpen, 
  Layers, 
  HelpCircle as QuizIcon,
  ChevronDown,
  Award,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudyNotesPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params; // articleId
  const { isAuthenticated, isLoading: authLoading, getAuthHeaders, apiUrl } = useAuth();

  // Navigation Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  // Loaded Revision result states
  const [loading, setLoading] = useState(true);
  const [articleTitle, setArticleTitle] = useState('');
  const [studyText, setStudyText] = useState('');
  const [flashcards, setFlashcards] = useState<Array<{ question: string; answer: string }>>([]);
  const [quizzes, setQuizzes] = useState<Array<{ question: string; options: string[]; correctAnswer: string; explanation: string }>>([]);
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);
  const [globalError, setGlobalError] = useState('');

  // Interactive UI Layout states
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz' | 'faqs'>('flashcards');

  // FLASHCARDS DECK STATES
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // QUIZ ENGINE STATES
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswersRecord, setQuizAnswersRecord] = useState<boolean[]>([]);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  // FAQs EXPANSE STATES
  const [activeFaqIdx, setActiveFaqIdx] = useState<number | null>(null);

  // Fetch Study Notes
  useEffect(() => {
    if (!isAuthenticated || !id) return;

    const fetchNotes = async () => {
      try {
        setLoading(true);
        setGlobalError('');

        // 1. Fetch notes historical record
        const response = await fetch(`${apiUrl}/history/notes/${id}`, {
          headers: getAuthHeaders()
        });
        const data = await response.json();

        if (data.success && data.notes) {
          const notes = data.notes;
          setArticleTitle(notes.articleId?.title || 'Synthesis Deck');
          setStudyText(notes.studyNotesText || '');
          setFlashcards(notes.flashcards || []);
          setQuizzes(notes.quizQuestions || []);
          setFaqs(notes.faqs || []);
        } else {
          // If notes are not compiled yet, trigger notes compiler API
          const compileRes = await fetch(`${apiUrl}/ai/notes`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              articleId: id,
              text: localStorage.getItem('simplifier_autoload_original') || 'Sample text placeholder',
              title: localStorage.getItem('simplifier_autoload_title') || 'Synthesis Deck'
            })
          });
          const compileData = await compileRes.json();
          if (compileData.success) {
            setArticleTitle(compileData.title || 'Synthesis Deck');
            setStudyText(compileData.studyNotesText || '');
            setFlashcards(compileData.flashcards || []);
            setQuizzes(compileData.quizQuestions || []);
            setFaqs(compileData.faqs || []);
          } else {
            setGlobalError('Failed to parse active revision metrics from server.');
          }
        }
      } catch (err) {
        setGlobalError('Connection to revision engine timed out.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [id, isAuthenticated, apiUrl, getAuthHeaders]);

  // Quiz submission scorer
  const handleQuizAnswerSubmit = () => {
    if (!selectedOption || isAnswerSubmitted) return;

    const currentQuiz = quizzes[currentQuizIdx];
    const isCorrect = selectedOption === currentQuiz.correctAnswer;
    
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }
    
    setQuizAnswersRecord((prev) => [...prev, isCorrect]);
    setIsAnswerSubmitted(true);
  };

  const handleNextQuizQuestion = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    
    if (currentQuizIdx + 1 < quizzes.length) {
      setCurrentQuizIdx((prev) => prev + 1);
    } else {
      setIsQuizComplete(true);
    }
  };

  const resetQuizSession = () => {
    setCurrentQuizIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizAnswersRecord([]);
    setIsQuizComplete(false);
  };

  if (authLoading || loading) {
    return <LoadingScreen isLoading={true} message="Assembling active recall flashcards & quizzes..." />;
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden">
      <ParticleBg />
      <Header />

      {/* Main Revision Container */}
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 w-full">
        
        {/* Navigation back and header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[10px] font-bold text-accent-purple uppercase tracking-wider block">
                Study Revision Suite
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight font-space text-white truncate max-w-xs md:max-w-md">
                {articleTitle}
              </h1>
            </div>
          </div>

          {/* Quick tab controls */}
          <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/5 self-start md:self-auto shrink-0">
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`px-4 py-2 text-xs font-bold tracking-wide rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'flashcards' ? 'bg-accent-indigo text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Flashcards</span>
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-4 py-2 text-xs font-bold tracking-wide rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'quiz' ? 'bg-accent-purple text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <QuizIcon className="w-3.5 h-3.5" />
              <span>Active Quiz</span>
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`px-4 py-2 text-xs font-bold tracking-wide rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'faqs' ? 'bg-accent-pink text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Digest Notes</span>
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {globalError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl flex items-center space-x-2 text-xs">
            <X className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{globalError}</span>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          
          {/* ========================================== */}
          {/* OPTION 1: INTERACTIVE 3D CSS FLASHCARDS   */}
          {/* ========================================== */}
          {activeTab === 'flashcards' && (
            <div className="space-y-6">
              {flashcards.length > 0 ? (
                <div className="flex flex-col items-center">
                  
                  {/* Flipped card wrapper */}
                  <div 
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                    className="w-full max-w-xl h-80 perspective-1000 cursor-pointer select-none group"
                  >
                    <div 
                      className={`w-full h-full transform-style-3d transition-transform duration-700 relative ${
                        isCardFlipped ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* FRONT CARD SIDE */}
                      <GlassCard className="absolute inset-0 p-8 flex flex-col justify-between items-center text-center border-accent-purple/30 bg-slate-900/40 backface-hidden shadow-glass-neon">
                        <span className="text-[10px] font-bold text-accent-purple uppercase tracking-widest font-space">
                          Flashcard Question
                        </span>
                        
                        <p className="text-base sm:text-lg md:text-xl font-bold font-space text-white leading-relaxed max-w-sm">
                          {flashcards[currentCardIdx]?.question}
                        </p>

                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          Click card to flip answer
                        </span>
                      </GlassCard>

                      {/* BACK CARD SIDE */}
                      <GlassCard className="absolute inset-0 p-8 flex flex-col justify-between items-center text-center border-accent-pink/30 bg-slate-950/95 backface-hidden rotate-y-180 shadow-glass">
                        <span className="text-[10px] font-bold text-accent-pink uppercase tracking-widest font-space">
                          Decompressed Explanation
                        </span>
                        
                        <p className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed max-w-md">
                          {flashcards[currentCardIdx]?.answer}
                        </p>

                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          Click card to flip question
                        </span>
                      </GlassCard>

                    </div>
                  </div>

                  {/* Card deck controls */}
                  <div className="flex items-center space-x-6 mt-8 p-3 bg-white/5 border border-white/5 rounded-2xl">
                    <button
                      onClick={() => {
                        if (currentCardIdx > 0) {
                          setIsCardFlipped(false);
                          setTimeout(() => setCurrentCardIdx((prev) => prev - 1), 150);
                        }
                      }}
                      disabled={currentCardIdx === 0}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <span className="text-xs font-bold text-slate-300 font-space tracking-wide">
                      Card {currentCardIdx + 1} of {flashcards.length}
                    </span>

                    <button
                      onClick={() => {
                        if (currentCardIdx + 1 < flashcards.length) {
                          setIsCardFlipped(false);
                          setTimeout(() => setCurrentCardIdx((prev) => prev + 1), 150);
                        }
                      }}
                      disabled={currentCardIdx + 1 === flashcards.length}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>

                </div>
              ) : (
                <GlassCard className="p-12 text-center text-slate-500 py-20">
                  <Layers className="w-12 h-12 text-slate-700 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs uppercase tracking-wider font-space">No revision cards synthesized.</p>
                </GlassCard>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* OPTION 2: MULTIPLE-CHOICE QUIZ SESSION     */}
          {/* ========================================== */}
          {activeTab === 'quiz' && (
            <div className="space-y-6">
              {quizzes.length > 0 ? (
                !isQuizComplete ? (
                  
                  /* Active quiz card */
                  <GlassCard className="p-6 md:p-8 border-white/10 shadow-glass">
                    
                    {/* Progress tracking */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                      <span className="text-[10px] font-bold text-accent-purple uppercase tracking-wider font-space">
                        Assessment Question {currentQuizIdx + 1} of {quizzes.length}
                      </span>
                      
                      {/* Interactive score dots */}
                      <div className="flex space-x-1">
                        {quizzes.map((_, idx) => (
                          <span 
                            key={idx}
                            className={`w-2.5 h-2.5 rounded-full border border-white/10 ${
                              idx === currentQuizIdx 
                                ? 'bg-accent-purple scale-110 shadow-neon-glow'
                                : quizAnswersRecord[idx] !== undefined 
                                  ? quizAnswersRecord[idx] 
                                    ? 'bg-accent-emerald' 
                                    : 'bg-red-500'
                                  : 'bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Question text */}
                    <h3 className="text-base sm:text-lg font-bold font-space text-white leading-relaxed mb-6">
                      {quizzes[currentQuizIdx]?.question}
                    </h3>

                    {/* Question choices list */}
                    <div className="space-y-3">
                      {quizzes[currentQuizIdx]?.options.map((option, idx) => {
                        const isCorrectOption = option === quizzes[currentQuizIdx].correctAnswer;
                        const isOptionSelected = option === selectedOption;
                        
                        let optionStyles = "border-white/5 bg-slate-900/10 hover:bg-slate-900/30 text-slate-300";
                        if (isOptionSelected) optionStyles = "border-accent-purple bg-accent-purple/5 text-white";
                        
                        if (isAnswerSubmitted) {
                          if (isCorrectOption) {
                            optionStyles = "border-accent-emerald bg-accent-emerald/10 text-emerald-200 shadow-neon-emerald";
                          } else if (isOptionSelected) {
                            optionStyles = "border-red-500 bg-red-500/10 text-red-200";
                          } else {
                            optionStyles = "border-white/5 bg-slate-900/5 text-slate-500 cursor-not-allowed";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => !isAnswerSubmitted && setSelectedOption(option)}
                            disabled={isAnswerSubmitted}
                            className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between text-xs md:text-sm font-semibold ${optionStyles}`}
                          >
                            <span>{option}</span>
                            {isAnswerSubmitted && isCorrectOption && <Check className="w-4.5 h-4.5 text-accent-emerald shrink-0" />}
                            {isAnswerSubmitted && isOptionSelected && !isCorrectOption && <X className="w-4.5 h-4.5 text-red-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Submit and Next controls */}
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between gap-4">
                      
                      {!isAnswerSubmitted ? (
                        <button
                          onClick={handleQuizAnswerSubmit}
                          disabled={!selectedOption}
                          className="px-6 py-2.5 rounded-xl bg-accent-purple text-white font-bold text-xs uppercase tracking-wider hover:scale-102 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Submit Response
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuizQuestion}
                          className="px-6 py-2.5 rounded-xl neon-button text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5"
                        >
                          <span>{currentQuizIdx + 1 === quizzes.length ? 'Finalize Quiz' : 'Proceed Question'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}

                    </div>

                    {/* AI Pedagogical explanation */}
                    <AnimatePresence>
                      {isAnswerSubmitted && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="mt-6 p-4 bg-white/5 border border-white/5 rounded-2xl overflow-hidden text-xs md:text-sm text-slate-300 leading-relaxed"
                        >
                          <div className="flex items-center space-x-1.5 text-accent-purple font-bold font-space uppercase text-xs mb-2">
                            <GraduationCap className="w-4.5 h-4.5" />
                            <span>AI Scholar Explanation</span>
                          </div>
                          <p>{quizzes[currentQuizIdx]?.explanation}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </GlassCard>
                ) : (
                  
                  /* Quiz finished assessment results card */
                  <GlassCard className="p-8 border-accent-purple/30 shadow-glass-neon text-center max-w-xl mx-auto flex flex-col items-center">
                    <Award className="w-16 h-16 text-yellow-400 animate-bounce mb-4" />
                    
                    <span className="text-[10px] font-bold text-accent-purple uppercase tracking-widest font-space">
                      Assessment Synthesis Completed
                    </span>

                    <h2 className="text-2xl font-extrabold text-white font-space mt-2">
                      {quizScore >= quizzes.length - 1 ? 'Comprehension Master!' : 'Academic Level Up!'}
                    </h2>

                    <div className="my-6 p-6 rounded-2xl bg-white/5 border border-white/5 w-full max-w-xs">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Final Scoring index
                      </span>
                      <span className="text-4xl md:text-5xl font-extrabold text-white font-space mt-2 block">
                        {quizScore} / {quizzes.length}
                      </span>
                      <span className="text-[10px] text-accent-emerald font-semibold uppercase tracking-wide block mt-2">
                        {Math.round((quizScore / quizzes.length) * 100)}% accuracy rate
                      </span>
                    </div>

                    <p className="text-slate-400 text-xs leading-relaxed max-w-sm mb-6">
                      Excellent work! The core frameworks of this document are now mapped directly to your visual study memory index.
                    </p>

                    <div className="flex space-x-3">
                      <button
                        onClick={resetQuizSession}
                        className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-slate-300 text-xs font-bold font-space uppercase transition-all flex items-center space-x-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry Quiz</span>
                      </button>
                      <button
                        onClick={() => router.push('/dashboard')}
                        className="px-5 py-2.5 rounded-xl neon-button text-white text-xs font-bold font-space uppercase flex items-center"
                      >
                        <span>Dashboard Command</span>
                      </button>
                    </div>
                  </GlassCard>
                )
              ) : (
                <GlassCard className="p-12 text-center text-slate-500 py-20">
                  <QuizIcon className="w-12 h-12 text-slate-700 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs uppercase tracking-wider font-space">No evaluation quizzes synthesized.</p>
                </GlassCard>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* OPTION 3: EXPANSE STUDY NOTES & FAQs      */}
          {/* ========================================== */}
          {activeTab === 'faqs' && (
            <div className="space-y-6">
              
              {/* Main notes outline text block */}
              {studyText && (
                <GlassCard className="p-6 border-white/5 bg-slate-900/10 text-slate-300 text-xs md:text-sm leading-relaxed pr-2">
                  <div className="flex items-center space-x-1.5 text-accent-purple font-bold font-space uppercase text-xs mb-4">
                    <BookOpen className="w-4.5 h-4.5" />
                    <span>Summary Conceptual Outline</span>
                  </div>
                  <div className="whitespace-pre-line text-slate-200">
                    {studyText}
                  </div>
                </GlassCard>
              )}

              {/* FAQs accordion lists */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-space text-slate-400 tracking-wider uppercase mb-2">
                  Sequential Concept FAQ Breakdown
                </h3>

                {faqs.length > 0 ? (
                  faqs.map((faqItem, idx) => (
                    <GlassCard
                      key={idx}
                      className="p-5 border-white/5 bg-slate-900/5 cursor-pointer select-none"
                      onClick={() => setActiveFaqIdx(activeFaqIdx === idx ? null : idx)}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs md:text-sm font-bold font-space text-slate-200">
                          {faqItem.question}
                        </h4>
                        <ChevronDown
                          className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                            activeFaqIdx === idx ? 'transform rotate-180 text-accent-purple' : ''
                          }`}
                        />
                      </div>
                      
                      <AnimatePresence initial={false}>
                        {activeFaqIdx === idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <p className="text-slate-400 text-xs leading-relaxed border-t border-white/5 pt-3">
                              {faqItem.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </GlassCard>
                  ))
                ) : (
                  <GlassCard className="p-8 text-center text-slate-500 py-12">
                    <p className="text-xs uppercase tracking-wider font-space">No FAQs compiled for this deck.</p>
                  </GlassCard>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      <Footer />
    </div>
  );
}
