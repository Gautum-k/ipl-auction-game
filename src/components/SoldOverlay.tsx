'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Gavel, HeartHandshake } from 'lucide-react';
import { IPL_RULES, formatRupees } from '../config/rules';
import { Player, TeamState } from '../types';

export interface SoldOverlayProps {
  player: Player;
  winningTeam: TeamState;
  amount: number;
  isRtm: boolean;
  bcciWelfareFund?: number;
}

export const SoldOverlay: React.FC<SoldOverlayProps> = ({
  player,
  winningTeam,
  amount,
  isRtm,
  bcciWelfareFund,
}) => {
  const teamConfig = IPL_RULES.teamOptions.find((t) => t.id === winningTeam.teamId);
  const primaryColor = teamConfig?.primaryColor || '#F9CD05';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl text-white"
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl p-8 sm:p-12 text-center space-y-6 border-2 shadow-2xl overflow-hidden"
        style={{
          borderColor: primaryColor,
          backgroundColor: '#0F172A',
        }}
      >
        {/* Glow backdrop */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 blur-[120px] rounded-full pointer-events-none opacity-40"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="relative z-10 space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-sm border border-amber-500/30 uppercase tracking-widest">
            <Gavel className="w-4 h-4" /> {isRtm ? 'RTM EXERCISED & SOLD!' : 'SOLD! SOLD! SOLD!'}
          </div>

          {/* Player Name */}
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white">{player.name}</h2>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
            <span className="px-3 py-1 rounded-full bg-slate-800 font-bold">{player.role}</span>
            <span>•</span>
            <span>{player.country}</span>
          </div>

          {/* Price Callout */}
          <div className="py-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 shadow-inner">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Final Winning Bid</span>
            <p className="text-4xl sm:text-6xl font-black text-amber-400">{formatRupees(amount)}</p>

            {bcciWelfareFund && bcciWelfareFund > 0 && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>BCCI Welfare Fund Line Item: {formatRupees(bcciWelfareFund)}</span>
              </div>
            )}
          </div>

          {/* Winning Franchise Callout */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-slate-950 text-xl shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {winningTeam.shortName}
            </div>
            <div className="text-left">
              <span className="text-xs text-slate-400 block font-semibold">Acquired by</span>
              <p className="text-xl font-bold text-white">{winningTeam.teamName}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
