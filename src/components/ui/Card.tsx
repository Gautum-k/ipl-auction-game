import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, glass = true, className, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-3xl border border-slate-800 p-6 shadow-xl transition-all',
          glass ? 'bg-slate-900/80 backdrop-blur-xl' : 'bg-slate-900',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
