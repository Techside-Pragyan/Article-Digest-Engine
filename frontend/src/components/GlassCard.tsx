'use client';

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: 'purple' | 'blue' | 'pink' | 'emerald' | 'none';
  hoverEffect?: boolean;
  heavy?: boolean;
  animate?: boolean;
  delay?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  glowColor = 'none',
  hoverEffect = true,
  heavy = false,
  animate = true,
  delay = 0,
  className,
  ...props
}) => {
  const glowClasses = {
    none: '',
    purple: 'hover:shadow-glass-neon shadow-[0_8px_32px_0_rgba(139,92,246,0.1)] border-accent-purple/20',
    blue: 'hover:shadow-[0_8px_32px_0_rgba(59,130,246,0.25)] shadow-[0_8px_32px_0_rgba(59,130,246,0.1)] border-accent-blue/20',
    pink: 'hover:shadow-[0_8px_32px_0_rgba(236,72,153,0.25)] shadow-[0_8px_32px_0_rgba(236,72,153,0.1)] border-accent-pink/20',
    emerald: 'hover:shadow-neon-emerald shadow-[0_8px_32px_0_rgba(16,185,129,0.1)] border-accent-emerald/20',
  };

  const cardClasses = twMerge(
    clsx(
      'rounded-2xl transition-all duration-300',
      heavy ? 'glass-panel-heavy' : 'glass-panel',
      hoverEffect && 'hover:translate-y-[-2px] hover:border-white/15',
      glowClasses[glowColor],
      className
    )
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay }}
        className={cardClasses}
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};
