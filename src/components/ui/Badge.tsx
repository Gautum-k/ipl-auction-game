import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'gold' | 'emerald' | 'sky' | 'rose' | 'slate';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gold', className, ...props }) => {
  const variants = {
    gold: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    sky: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
};
