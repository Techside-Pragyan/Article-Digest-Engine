'use client';

import React from 'react';
import { BrainCircuit } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-8 mt-auto border-t border-white/5 bg-[#030712]/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo brand footer */}
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-5 h-5 text-accent-purple" />
            <span className="text-sm font-semibold tracking-wide text-slate-400 font-mono">
              Article<span className="text-accent-purple font-mono">Simplifier</span> © 2026
            </span>
          </div>

          {/* Copyrights / Notes */}
          <div className="text-center md:text-right">
            <p className="text-xs text-slate-500 font-mono tracking-wide">
              Powering intelligent scaffolded reading with Google Gemini AI. 🌌
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
