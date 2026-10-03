'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, DollarSign, Award, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { TeamState, Player, SoldRecord } from '../types';
import { formatRupees } from '../config/rules';

interface MyTeamPanelProps {
  myTeam: TeamState | null;
  maxPurse: number;
  soldPlayers: Array<{ player: Player; soldToTeamId: string; amount: number; isRtm: boolean }>;
  mode: 'MEGA_2025' | 'MINI_2026';
  teamColor?: string;
}

export const MyTeamPanel: React.FC<MyTeamPanelProps> = ({
  myTeam,
  maxPurse,
  soldPlayers,
  mode,
  teamColor = '#F59E0B',
}) => {
  if (!myTeam) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-white text-base">No Franchise Claimed</h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          You must claim a franchise in the lobby to view your dedicated &quot;My Team&quot; strategic panel!
        </p>
      </div>
    );
  }

  const squadCount = myTeam.squad.length;
  const purseSpent = maxPurse - myTeam.purseRemaining;
  const batCount = myTeam.squad.filter((p) => p.role === 'BATTER').length;
  const bowlCount = myTeam.squad.filter((p) => p.role === 'BOWLER').length;
  const arCount = myTeam.squad.filter((p) => p.role === 'ALL_ROUNDER').length;
  const wkCount = myTeam.squad.filter((p) => p.role === 'WICKETKEEPER').length;
  const overseasCount = myTeam.squad.filter((p) => p.isOverseas).length;
  const overseasLeft = 8 - overseasCount;

  const minSquadSlotsNeeded = Math.max(0, 18 - squadCount);

  // Price paid lookup
  const getPlayerBoughtAmount = (targetPlayerId: string, fallbackBase: number) => {
    const record = soldPlayers.find((s) => s.player.id === targetPlayerId);
    return record ? record.amount : fallbackBase;
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Franchise Hero Card */}
      <div
        className="rounded-3xl p-5 border shadow-xl relative overflow-hidden text-white"
        style={{
          background: `linear-gradient(135deg, ${teamColor}20 0%, #0F172A 100%)`,
          borderColor: `${teamColor}40`,
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full inline-block shadow-md"
                style={{ backgroundColor: teamColor }}
              />
              <h3 className="text-xl font-black tracking-tight">{myTeam.teamName}</h3>
              <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px]">
                {myTeam.shortName}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">Owner: {myTeam.ownerName || 'You'}</p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Purse Remaining
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {formatRupees(myTeam.purseRemaining)}
            </span>
          </div>
        </div>

        {/* Financial & Card Metrics */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-center">
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="block text-[10px] text-slate-400">Total Spent</span>
            <span className="font-mono font-bold text-amber-400 text-sm">{formatRupees(purseSpent)}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="block text-[10px] text-slate-400">Squad Size</span>
            <span className="font-bold text-white text-sm">{squadCount} / 25</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="block text-[10px] text-slate-400">RTM Cards Left</span>
            <span className="font-bold text-sky-400 text-sm">{mode === 'MEGA_2025' ? myTeam.rtmRemaining : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Roster Requirements & Slot Progress Panel */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" /> Mandatory Squad Requirements
        </h4>

        <div className="grid sm:grid-cols-2 gap-3">
          {/* Min Squad Requirement */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold text-[11px]">Min Squad (18-25)</span>
              {squadCount >= 18 ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
                  <CheckCircle2 className="w-3 h-3" /> Minimum Met ({squadCount})
                </span>
              ) : (
                <span className="text-amber-400 font-bold flex items-center gap-1 text-[10px]">
                  <AlertTriangle className="w-3 h-3" /> Need {minSquadSlotsNeeded} more
                </span>
              )}
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${squadCount >= 18 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(100, (squadCount / 18) * 100)}%` }}
              />
            </div>
          </div>

          {/* Overseas Slot Limit */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold text-[11px]">Overseas Limit (Max 8)</span>
              <span className={overseasLeft === 0 ? 'text-rose-400 font-bold text-[10px]' : 'text-sky-400 font-bold text-[10px]'}>
                {overseasCount}/8 used ({overseasLeft} left)
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${overseasLeft === 0 ? 'bg-rose-500' : 'bg-sky-500'}`}
                style={{ width: `${(overseasCount / 8) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Squad Balance Breakdown */}
        <div className="grid grid-cols-4 gap-2 text-center pt-1">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
            <span className="block text-slate-400 text-[10px]">Batters</span>
            <span className="font-bold text-white text-sm">{batCount}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
            <span className="block text-slate-400 text-[10px]">Bowlers</span>
            <span className="font-bold text-white text-sm">{bowlCount}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
            <span className="block text-slate-400 text-[10px]">All-Rounders</span>
            <span className="font-bold text-white text-sm">{arCount}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
            <span className="block text-slate-400 text-[10px]">Wicketkeepers</span>
            <span className="font-bold text-white text-sm">{wkCount}</span>
          </div>
        </div>
      </div>

      {/* Signed Players Roster with Prices */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Signed Squad Players ({squadCount})
          </h4>
          <span className="text-[10px] text-slate-400">Winning Bids</span>
        </div>

        {squadCount > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {myTeam.squad.map((p, idx) => {
              const pricePaid = getPlayerBoughtAmount(p.id, p.basePrice);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate">{p.name}</span>
                        {p.isOverseas && (
                          <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[9px] font-bold">
                            ✈️ Overseas
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {p.role} • {p.country}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <span className="font-mono font-bold text-amber-400 text-sm block">
                      {formatRupees(pricePaid)}
                    </span>
                    <span className="text-[10px] text-slate-500">Base: {formatRupees(p.basePrice)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs italic">
            You haven&apos;t won any players yet! Start bidding on upcoming players in the spotlight console.
          </div>
        )}
      </div>
    </div>
  );
};
