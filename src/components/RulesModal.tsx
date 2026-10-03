'use client';

import React from 'react';
import { X, ShieldCheck, DollarSign, Users, Award, Clock, Layers, TrendingUp, RefreshCw, Landmark } from 'lucide-react';
import { IPL_RULES, formatRupees } from '../config/rules';
import { PracticeRound } from './PracticeRound';
import { Glossary } from './Glossary';

export const RulesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 overflow-y-auto max-h-[92vh] text-slate-200 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Official IPL Auction Rules & Beginner Guide</h2>
              <p className="text-xs text-slate-400">Purse limits, squad rules, RTM cards, pay caps, and bidding mechanics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comprehensive Rules Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <DollarSign className="w-4 h-4" /> Team Purse & Reserve
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mega mode purse: <strong>₹120 Crore</strong>. Mini mode purse: <strong>₹125 Crore</strong>. Teams must maintain reserve funds to buy at least {IPL_RULES.minSquadSize} players.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Users className="w-4 h-4" /> Squad & Overseas Limits
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Squad size: <strong>{IPL_RULES.minSquadSize} to {IPL_RULES.maxSquadSize} players</strong>. Max overseas players allowed: <strong>{IPL_RULES.maxOverseasPlayers}</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
              <TrendingUp className="w-4 h-4" /> Bid Increments Ladder
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Below ₹1 Cr: <strong>+₹5 Lakhs</strong> | ₹1–2 Cr: <strong>+₹10 Lakhs</strong> | ₹2–5 Cr: <strong>+₹20 Lakhs</strong> | ₹5–10 Cr: <strong>+₹25 Lakhs</strong> | &gt;₹10 Cr: <strong>+₹50 Lakhs</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
              <Clock className="w-4 h-4" /> Timer & Anti-Snipe
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Base bidding timer: {IPL_RULES.timerDurations.biddingSeconds}s. Resets to {IPL_RULES.timerDurations.resetOnBidSeconds}s when a bid arrives. Bids in final 3 seconds add +5 seconds anti-snipe extension.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <Layers className="w-4 h-4" /> Sets & Accelerated Round
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Players are grouped into Marquee 1 & 2, Capped Batters, Bowlers, All-Rounders, Keepers, and Uncapped sets. Unsold players re-enter in the fast-track Accelerated Round.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
              <Award className="w-4 h-4" /> Right To Match (Mega Mode)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Each team can retain up to 6 players total via retentions & RTM cards. When bidding ends, the former franchise can match the highest bid to keep their player.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 sm:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
              <Landmark className="w-4 h-4" /> Overseas Pay Cap (Mini Mode)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              In Mini mode, overseas players have a maximum payout cap of <strong>₹18 Crore</strong>. Any bidding surplus above ₹18 Cr is automatically contributed to the <strong>BCCI Welfare Fund</strong> line item in the sold summary!
            </p>
          </div>
        </div>

        {/* Practice Sandbox */}
        <PracticeRound />

        {/* Glossary */}
        <Glossary />

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition shadow-lg shadow-amber-500/20"
          >
            Got It, Back to Game!
          </button>
        </div>
      </div>
    </div>
  );
};

