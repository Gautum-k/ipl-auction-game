"use client";

import React, { useState, useEffect } from 'react';

export const Footer: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 py-6 px-4 text-slate-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="space-y-1">
          <p className="font-semibold text-slate-300">
            IPL Auction Room &copy; {mounted ? new Date().getFullYear() : ''} — Free & Open Source (MIT License)
          </p>
          <p className="text-slate-500 max-w-2xl leading-relaxed">
            <strong>Disclaimer:</strong> This is an unofficial fan project and is NOT affiliated with, authorized by,
            endorsed by, or in any way associated with the Board of Control for Cricket in India (BCCI), the Indian
            Premier League (IPL), or any IPL franchises. All team names, logos, and trademarks belong to their respective owners.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-1 text-slate-400">
          <p>
            Stats & Data powered by{' '}
            <a
              href="https://cricsheet.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline font-medium"
            >
              Cricsheet
            </a>
          </p>
          <p className="text-[11px] text-slate-600">Built for cricket fans worldwide 🏏</p>
        </div>
      </div>
    </footer>
  );
};
