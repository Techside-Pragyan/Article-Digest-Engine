'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GlassCard } from '@/components/GlassCard';
import { ParticleBg } from '@/components/ParticleBg';
import { 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  Volume2, 
  Layers, 
  BookOpen, 
  HelpCircle,
  CheckCircle,
  Lock,
  ChevronDown,
  BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock FAQ data
const FAQ_ITEMS = [
  {
    question: "How does the AI simplify articles so effectively?",
    answer: "Our system is powered by advanced LLM algorithms (Google Gemini API). It parses sentences to identify high-density vocabulary, maps them to contextual simple equivalents, and restructures sentence trees to deliver three levels of custom readability: ELI5 (5-year-old child), Student (contextual analogies), and Bullets (structured executive highlights)."
  },
  {
    question: "Can I upload textbooks or research papers directly?",
    answer: "Absolutely! The platform supports direct file uploading for PDFs, DOCX files, and raw text files up to 10MB. We parse the document structure, extract clean text, and feed it into the active workspace pipeline where you can customize your reading options."
  },
  {
    question: "Is there a limit on the length of articles or pages I can scrape?",
    answer: "Our scraper can extract content from virtually any public article URL, blog, or document. To ensure optimal performance and speed, articles are capped at 60,000 characters (approximately 10,000 words) per simplification run."
  },
  {
    question: "Can I generate flashcards and quizzes from any article?",
    answer: "Yes, every simplified article is saved in your central study library, allowing you to instantly generate 3D click-to-flip flashcards, practice quizzes with interactive grading, and sequential revision guidelines with a single click."
  }
];

export default function LandingPage() {
  const [demoInput, setDemoInput] = useState(
    "The epigenetic modifications, specifically DNA methylation and histone acetylation, exhibit dynamic alterations in response to high-density cognitive training, thereby modulating transcriptional activities relevant to synaptic plasticity and long-term potentiation."
  );
  const [demoOutput, setDemoOutput] = useState("");
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const runDemoSimplification = () => {
    if (isDemoRunning) return;
    setIsDemoRunning(true);
    setDemoOutput("");

    const mockOutput = "Simplified (ELI5):\nOur brains can change how they work based on what we practice! When we train our minds, it acts like a series of light switches turning on helper cells in our brains. This makes our brain connections stronger, helping us store new memories much faster.";
    
    // Simulate real-time streaming effect
    let currentIdx = 0;
    const interval = setInterval(() => {
      setDemoOutput((prev) => prev + mockOutput[currentIdx]);
      currentIdx++;
      if (currentIdx >= mockOutput.length) {
        clearInterval(interval);
        setIsDemoRunning(false);
      }
    }, 15);
  };

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden">
      {/* Background Interactive canvas particles */}
      <ParticleBg />
      
      <Header />

      {/* Main landing container */}
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 relative z-10">
        
        {/* HERO SECTION */}
        <section className="text-center mt-8 mb-16 md:mt-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-accent-purple/10 px-4 py-1.5 rounded-full border border-accent-purple/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-accent-purple animate-pulse" />
            <span className="text-xs md:text-sm font-semibold tracking-wide text-accent-purple font-space uppercase">
              Next-Gen Academic Simplifier SaaS
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight font-space leading-[1.1] max-w-5xl mx-auto text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400"
          >
            Deconstruct Academic Jargon.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-indigo via-accent-purple to-accent-pink">
              Learn Like a Genius.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            Turn dense research articles, long PDF documents, and academic jargon into easily digestible concepts. Learn faster with 3D revision flashcards and voice synthesis feedback.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <Link
              href="/auth"
              className="neon-button px-8 py-3.5 rounded-xl font-bold tracking-wide text-white flex items-center space-x-2 text-base w-full sm:w-auto justify-center"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#demo"
              className="px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 font-bold tracking-wide text-slate-200 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-base w-full sm:w-auto text-center"
            >
              Watch Live Demo
            </a>
          </motion.div>
        </section>

        {/* INTERACTIVE DEMO SCREEN */}
        <section id="demo" className="mb-24 scroll-mt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <GlassCard className="max-w-5xl mx-auto p-1.5 md:p-2 border-accent-purple/20 shadow-glass-neon relative">
              
              {/* Outer decorative elements */}
              <div className="absolute top-2 right-4 flex space-x-1.5 z-20">
                <span className="w-3 h-3 rounded-full bg-red-500/50" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <span className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>

              {/* Demo Window Grid */}
              <div className="grid md:grid-cols-2 rounded-2xl overflow-hidden bg-slate-950/70 divide-y md:divide-y-0 md:divide-x divide-white/5">
                
                {/* Input Panel */}
                <div className="p-6 flex flex-col justify-between min-h-[300px]">
                  <div>
                    <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                      <Cpu className="w-4 h-4 text-accent-blue" />
                      <span>Input Complex Article Jargon</span>
                    </div>
                    <textarea
                      value={demoInput}
                      onChange={(e) => setDemoInput(e.target.value)}
                      disabled={isDemoRunning}
                      className="w-full h-44 bg-transparent border-0 p-0 text-slate-200 focus:ring-0 resize-none font-sans text-sm md:text-base leading-relaxed placeholder-slate-600 focus:outline-none"
                      placeholder="Paste scientific papers, dense essays or documents here..."
                    />
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-xs text-slate-500">Character Limit: 5,000</span>
                    <button
                      onClick={runDemoSimplification}
                      disabled={isDemoRunning || !demoInput.trim()}
                      className={`neon-button px-5 py-2 rounded-xl text-xs md:text-sm font-semibold text-white tracking-wide flex items-center space-x-1.5 ${
                        isDemoRunning ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isDemoRunning ? 'Decompressing...' : 'Decompress AI'}</span>
                    </button>
                  </div>
                </div>

                {/* Output Panel */}
                <div className="p-6 bg-slate-950/40 flex flex-col justify-between min-h-[300px]">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-accent-purple" />
                        <span>AI Transformed Explanation</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-accent-purple/20 text-accent-purple border border-accent-purple/30 font-semibold tracking-wide font-space uppercase">
                        ELI5 Mode
                      </span>
                    </div>

                    <div className="h-44 overflow-y-auto text-slate-300 text-sm md:text-base leading-relaxed font-sans pr-2">
                      {isDemoRunning && !demoOutput && (
                        <div className="flex flex-col space-y-2 mt-4 animate-pulse">
                          <div className="h-4 bg-white/5 rounded w-3/4" />
                          <div className="h-4 bg-white/5 rounded w-5/6" />
                          <div className="h-4 bg-white/5 rounded w-2/3" />
                        </div>
                      )}
                      {demoOutput ? (
                        <div className="whitespace-pre-line text-slate-200">
                          {demoOutput}
                        </div>
                      ) : (
                        !isDemoRunning && (
                          <div className="text-slate-500 flex flex-col items-center justify-center h-full text-center mt-8">
                            <BrainCircuit className="w-12 h-12 text-slate-700 mb-2 animate-bounce" />
                            <p className="text-xs uppercase font-space tracking-wider">Click "Decompress AI" to view transformation</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Volume2 className="w-4 h-4 text-accent-pink" />
                      <span className="text-xs">Dynamic Voice Synthesis Ready</span>
                    </div>
                    <span className="text-[10px] text-accent-purple animate-pulse">Ready</span>
                  </div>
                </div>

              </div>
            </GlassCard>
          </motion.div>
        </section>

        {/* CORE FEATURES GRID */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-space text-white">
              An Elevated Reading Experience
            </h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-sm md:text-base">
              Packed with active study tools designed to maximize academic retention, glossary checks, and interactive flashcard summaries.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-6 h-full flex flex-col justify-between border-white/5 bg-slate-900/10">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-accent-blue/10 flex items-center justify-center border border-accent-blue/20 mb-6 text-accent-blue">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold font-space text-white mb-2">ELI5 Simplification</h3>
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                    Convert advanced articles, biology research, economics papers, or legal codes into concepts as simple as explaining to a 5-year-old child.
                  </p>
                </div>
                <div className="mt-6 flex items-center text-xs text-accent-blue font-semibold uppercase tracking-wider">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </GlassCard>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-6 h-full flex flex-col justify-between border-white/5 bg-slate-900/10">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-accent-purple/10 flex items-center justify-center border border-accent-purple/20 mb-6 text-accent-purple">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold font-space text-white mb-2">Voice Speech Synthesis</h3>
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                    Listen to simplified materials on the go using browser-synthesized audio. Fully adjust voice speech velocity rates for high retention auditing.
                  </p>
                </div>
                <div className="mt-6 flex items-center text-xs text-accent-purple font-semibold uppercase tracking-wider">
                  <span>Listen in</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </GlassCard>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-6 h-full flex flex-col justify-between border-white/5 bg-slate-900/10">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-accent-pink/10 flex items-center justify-center border border-accent-pink/20 mb-6 text-accent-pink">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold font-space text-white mb-2">3D Revision Flashcards</h3>
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                    Auto-generate beautiful CSS click-to-flip cards containing definitions, context triggers, and quizzes to test learning parameters.
                  </p>
                </div>
                <div className="mt-6 flex items-center text-xs text-accent-pink font-semibold uppercase tracking-wider">
                  <span>Practice mode</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </GlassCard>
            </motion.div>

          </div>
        </section>

        {/* PRICING PLANS */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-space text-white">
              SaaS SaaS-less Value Packages
            </h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-sm md:text-base">
              Get premium features built natively inside the application with offline local fallback.
            </p>
          </div>

          <div className="grid md:grid-cols-2 max-w-4xl mx-auto gap-8">
            
            {/* Free Plan */}
            <GlassCard className="p-8 flex flex-col justify-between border-white/5 relative bg-slate-900/5 overflow-hidden">
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] bg-slate-800 text-slate-300 font-semibold tracking-wide font-space uppercase border border-slate-700">
                  Standard Level
                </span>
                <h3 className="text-2xl font-bold font-space text-white mt-4">Free Gateway</h3>
                <p className="text-slate-400 mt-2 text-xs md:text-sm">Perfect for occasional learning and reading complex academic pieces.</p>
                
                <div className="my-6">
                  <span className="text-4xl md:text-5xl font-extrabold text-white font-space">$0</span>
                  <span className="text-slate-500 text-sm ml-2">/ lifetime access</span>
                </div>

                <ul className="space-y-3 pt-6 border-t border-white/5">
                  <li className="flex items-center space-x-2.5 text-slate-300 text-xs md:text-sm">
                    <CheckCircle className="w-4 h-4 text-accent-emerald flex-shrink-0" />
                    <span>3 article simplifications daily</span>
                  </li>
                  <li className="flex items-center space-x-2.5 text-slate-300 text-xs md:text-sm">
                    <CheckCircle className="w-4 h-4 text-accent-emerald flex-shrink-0" />
                    <span>URL scraper & Text input integration</span>
                  </li>
                  <li className="flex items-center space-x-2.5 text-slate-300 text-xs md:text-sm">
                    <CheckCircle className="w-4 h-4 text-accent-emerald flex-shrink-0" />
                    <span>Standard reading dashboard metrics</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href="/auth"
                  className="w-full text-center py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-slate-200 transition-all font-semibold tracking-wide text-sm block"
                >
                  Unlock Free Access
                </Link>
              </div>
            </GlassCard>

            {/* Premium Plan */}
            <GlassCard className="p-8 flex flex-col justify-between border-accent-purple/40 shadow-glass-neon relative bg-accent-purple/5 overflow-hidden">
              <div className="absolute top-4 right-4 bg-accent-purple/20 text-accent-purple text-[10px] font-bold px-3 py-1 rounded-full border border-accent-purple/30 uppercase tracking-wide">
                Best Option
              </div>
              
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] bg-accent-purple/20 text-accent-purple font-semibold tracking-wide font-space uppercase border border-accent-purple/30">
                  Elite Scholar
                </span>
                <h3 className="text-2xl font-bold font-space text-white mt-4">Premium Voyager</h3>
                <p className="text-slate-400 mt-2 text-xs md:text-sm">Complete study revision center with unrestricted AI comprehension pipelines.</p>
                
                <div className="my-6">
                  <span className="text-4xl md:text-5xl font-extrabold text-white font-space">$9</span>
                  <span className="text-slate-400 text-sm ml-2">/ monthly billed</span>
                </div>

                <ul className="space-y-3 pt-6 border-t border-white/5">
                  <li className="flex items-center space-x-2.5 text-slate-200 text-xs md:text-sm">
                    <CheckCircle className="w-4 h-4 text-accent-purple flex-shrink-0" />
                    <span>Unlimited PDF, DOCX, TXT parse imports</span>
                  </li>
                  <li className="flex items-center space-x-2.5 text-slate-200 text-xs md:text-sm">
                    <CheckCircle className="w-4 h-4 text-accent-purple flex-shrink-0" />
                    <span>Instant 3D CSS Flashcards generator</span>
                  </li>
                  <li className="flex items-center space-x-2.5 text-slate-200 text-xs md:text-sm">
                    <CheckCircle className="w-4 h-4 text-accent-purple flex-shrink-0" />
                    <span>Interactive quiz generator with explanations</span>
                  </li>
                  <li className="flex items-center space-x-2.5 text-slate-200 text-xs md:text-sm">
                    <CheckCircle className="w-4 h-4 text-accent-purple flex-shrink-0" />
                    <span>High quality TTS Audio controllers & speed sliders</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href="/auth"
                  className="w-full text-center py-3 rounded-xl neon-button text-white font-semibold tracking-wide text-sm block"
                >
                  Activate Elite Scholar
                </Link>
              </div>
            </GlassCard>

          </div>
        </section>

        {/* ACCORDION FAQ */}
        <section className="max-w-4xl mx-auto mb-20">
          <div className="text-center mb-16">
            <HelpCircle className="w-12 h-12 text-accent-purple mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-space text-white">
              Comprehension Clearinghouse
            </h2>
            <p className="text-slate-400 mt-2 max-w-md mx-auto text-sm">
              Answers to popular questions regarding our simplifier technology.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => (
              <GlassCard
                key={idx}
                className="p-5 border-white/5 bg-slate-900/5 cursor-pointer select-none"
                onClick={() => toggleFaq(idx)}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm md:text-base font-bold font-space text-slate-200">
                    {item.question}
                  </h4>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                      activeFaq === idx ? 'transform rotate-180 text-accent-purple' : ''
                    }`}
                  />
                </div>
                
                <AnimatePresence initial={false}>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-slate-400 text-xs md:text-sm leading-relaxed border-t border-white/5 pt-3">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ))}
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}
