'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'IPL';

  return (
    <div
      className={`relative rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 border border-slate-800 flex items-center justify-center font-black text-amber-400 select-none overflow-hidden shadow-md shrink-0 ${sizes[size]} ${className}`}
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes="96px"
          className="object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
