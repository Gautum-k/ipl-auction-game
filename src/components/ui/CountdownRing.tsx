import React from 'react';

export interface CountdownRingProps {
  secondsLeft: number;
  duration: number;
  size?: number;
}

export const CountdownRing: React.FC<CountdownRingProps> = ({ secondsLeft, duration, size = 64 }) => {
  const percentage = (secondsLeft / Math.max(1, duration)) * 100;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  const colorClass =
    secondsLeft > 7
      ? 'stroke-emerald-400 text-emerald-400'
      : secondsLeft > 3
      ? 'stroke-amber-400 text-amber-400'
      : 'stroke-rose-500 text-rose-500 animate-pulse';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-800"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={`transition-all duration-1000 ${colorClass}`}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <span className={`absolute font-black ${colorClass}`} style={{ fontSize: size * 0.35 }}>
        {secondsLeft}
      </span>
    </div>
  );
};
