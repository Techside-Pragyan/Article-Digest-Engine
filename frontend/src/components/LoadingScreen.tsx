'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  isLoading: boolean;
  message?: string;
  customPhrases?: string[];
}

const defaultPhrases = [
  'Decrypting complex research paper modules...',
  'Extracting core scientific thesis...',
  'Simplifying heavy methodologies and formulas...',
  'Re-authoring vocabulary into digestible blocks...',
  'Assembling interactive flashcards & revision sheets...',
  'Structuring custom graded assessment quizzes...',
  'Coalescing insights...'
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isLoading,
  message,
  customPhrases
}) => {
  const phrases = customPhrases || defaultPhrases;
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 3200);

    return () => clearInterval(interval);
  }, [isLoading, phrases.length]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#030712]/90 backdrop-blur-md"
        >
          {/* Glowing Radial Orb */}
          <div className="absolute w-[300px] h-[300px] rounded-full bg-accent-purple/10 blur-[80px] pointer-events-none animate-pulse-glow" />

          {/* Glowing Spinner Ring */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
              className="absolute inset-0 rounded-full border-4 border-accent-indigo/20 border-t-accent-purple shadow-neon-glow"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
              className="absolute w-[80%] h-[80%] rounded-full border-4 border-accent-pink/15 border-b-accent-pink"
            />
            <span className="text-xl font-bold tracking-widest text-accent-purple">AI</span>
          </div>

          {/* Loader Text Status */}
          <div className="mt-8 text-center px-6 max-w-lg z-10">
            <motion.h3 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-lg font-semibold tracking-wide text-slate-200 uppercase glow-text-purple"
            >
              {message || 'Processing with Gemini AI'}
            </motion.h3>

            <AnimatePresence mode="wait">
              <motion.p
                key={currentPhraseIndex}
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -5, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-3 text-sm text-slate-400 font-mono tracking-wide"
              >
                {phrases[currentPhraseIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
