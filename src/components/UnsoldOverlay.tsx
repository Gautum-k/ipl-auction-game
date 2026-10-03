'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Player } from '../types';

export const UnsoldOverlay: React.FC<{ player: Player }> = ({ player }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl text-white"
    >
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-widest">
          UNSOLD
        </span>
        <h2 className="text-3xl font-black text-white">{player.name}</h2>
        <p className="text-xs text-slate-400">
          No bids were placed. {player.name} moves to the unsold player list for potential accelerated round nomination.
        </p>
      </div>
    </motion.div>
  );
};
