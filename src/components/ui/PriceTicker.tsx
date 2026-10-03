import React from 'react';
import { formatRupees } from '../../config/rules';

export interface PriceTickerProps {
  amount: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const PriceTicker: React.FC<PriceTickerProps> = ({ amount, className = '', size = 'md' }) => {
  const sizes = {
    sm: 'text-sm font-bold',
    md: 'text-lg font-extrabold',
    lg: 'text-2xl font-black',
    xl: 'text-4xl font-black tracking-tight',
  };

  return (
    <span className={`font-mono text-amber-400 transition-all ${sizes[size]} ${className}`}>
      {formatRupees(amount)}
    </span>
  );
};
