'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, AlertCircle, Shield } from 'lucide-react';
import { TeamState, Player, SoldRecord } from '../types';
import { formatRupees } from '../config/rules';

interface TeamLiveCardProps {
  team: TeamState;
  maxPurse: number;
  isMyFranchise: boolean;
  isHighBidder: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  soldPlayers: Array<{ player: Player; soldToTeamId: string; amount: number; isRtm: boolean }>;
  isOverseasAuction: boolean;
  primaryColor?: string;
  secondaryColor?: string;
}

const TeamLiveCardComponent: React.FC<TeamLiveCardProps> = ({
  team,
  maxPurse,
  isMyFranchise,
  isHighBidder,
  isExpanded,
  onToggleExpand,
  soldPlayers,
  isOverseasAuction,
  primaryColor = '#3B82F6',
}) => {
  const batCount = team.squad.filter((p) => p.role === 'BATTER').length;
  const bowlCount = team.squad.filter((p) => p.role === 'BOWLER').length;
  const arCount = team.squad.filter((p) => p.role === 'ALL_ROUNDER').length;
  const wkCount = team.squad.filter((p) => p.role === 'WICKETKEEPER').length;
  const overseasCount = team.squad.filter((p) => p.isOverseas).length;
  const overseasLeft = 8 - overseasCount;
  const purseSpent = maxPurse - team.purseRemaining;

  // Exact price paid lookup helper
  const getPlayerBoughtAmount = (targetPlayerId: string, fallbackBase: number) => {
    const record = soldPlayers.find((s) => s.player.id === targetPlayerId);
    return record ? record.amount : fallbackBase;
  };

  return (
    <div
      className={`rounded-2xl border text-xs overflow-hidden transition-all duration-200 ${
        isHighBidder
          ? 'bg-amber-500/10 border-amber-500/60 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
          : isMyFranchise
          ? 'bg-slate-900 border-sky-400/50 shadow-sm'
          : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
      }`}
    >
      {/* Franchise Main Row */}
      <div
        onClick={onToggleExpand}
        className="p-3.5 cursor-pointer hover:bg-slate-800/40 transition flex items-center justify-between gap-3"
      >
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Color Accent Pill */}
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-sm"
              style={{ backgroundColor: primaryColor }}
            />
            <span className="font-bold text-white text-sm tracking-tight truncate">{team.shortName}</span>
            <span className="text-[11px] text-slate-400 font-normal truncate">({team.teamName})</span>

            {isMyFranchise && (
              <span className="px-1.5 py-0.5 rounded bg-sky-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shrink-0">
                MY TEAM
              </span>
            )}
            {isHighBidder && (
              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider shrink-0">
                HIGH BIDDER
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
            <span>
              Squad: <strong className="text-slate-200">{team.squad.length}/25</strong>
            </span>
            <span>•</span>
            <span>
              Spent: <strong className="text-slate-300">{formatRupees(purseSpent)}</strong>
            </span>
            <span>•</span>
            {/* Live Overseas Indicator */}
            <span className={overseasLeft === 0 ? 'text-rose-400 font-bold flex items-center gap-1' : 'text-sky-300'}>
              {overseasLeft === 0 && <AlertCircle className="w-3 h-3 inline text-rose-400" />}
              Overseas: <strong className={overseasLeft === 0 ? 'text-rose-400' : 'text-sky-300'}>{overseasCount}/8</strong>
              {overseasLeft === 0 ? ' (FULL)' : ` (${overseasLeft} left)`}
            </span>
          </div>
        </div>

        {/* Right side: Remaining Purse & Expand Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="font-mono font-bold text-emerald-400 text-sm sm:text-base block">
              {formatRupees(team.purseRemaining)}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Purse Left</span>
          </div>
          <div className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Overseas Bidding Warning Strip if player is overseas and team is full */}
      {isOverseasAuction && overseasLeft === 0 && (
        <div className="px-3 py-1 bg-rose-500/10 border-t border-rose-500/20 text-rose-400 text-[10px] font-bold flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 text-rose-400" />
          <span>Overseas limit reached (8/8 used) — cannot bid on current overseas player</span>
        </div>
      )}

      {/* Squad Balance Strip */}
      <div className="grid grid-cols-5 gap-1 text-[10px] text-center p-2 bg-slate-950/90 border-t border-slate-800/60">
        <div className="p-1 rounded bg-slate-900 text-slate-300">
          <span className="block text-slate-500 text-[9px]">BAT</span>
          <span className="font-bold text-slate-200">{batCount}</span>
        </div>
        <div className="p-1 rounded bg-slate-900 text-slate-300">
          <span className="block text-slate-500 text-[9px]">BOWL</span>
          <span className="font-bold text-slate-200">{bowlCount}</span>
        </div>
        <div className="p-1 rounded bg-slate-900 text-slate-300">
          <span className="block text-slate-500 text-[9px]">AR</span>
          <span className="font-bold text-slate-200">{arCount}</span>
        </div>
        <div className="p-1 rounded bg-slate-900 text-slate-300">
          <span className="block text-slate-500 text-[9px]">WK</span>
          <span className="font-bold text-slate-200">{wkCount}</span>
        </div>
        <div className={`p-1 rounded ${overseasLeft === 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-900 text-sky-400'} font-bold`}>
          <span className="block text-slate-500 text-[9px]">OVS</span>
          <span>{overseasCount}/8</span>
        </div>
      </div>

      {/* Expandable Roster of Bought Players */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-3 bg-slate-900/90 border-t border-slate-800 space-y-2"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Bought Players Roster ({team.squad.length})</span>
              {team.squad.length < 18 && (
                <span className="text-amber-400 font-semibold normal-case">
                  Needs {18 - team.squad.length} more (min 18)
                </span>
              )}
            </div>

            {team.squad.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {team.squad.map((boughtPlayer, idx) => {
                  const amountPaid = getPlayerBoughtAmount(boughtPlayer.id, boughtPlayer.basePrice);
                  return (
                    <div
                      key={boughtPlayer.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-slate-500 font-mono">{idx + 1}.</span>
                        <span className="font-bold text-white truncate">{boughtPlayer.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] shrink-0 font-medium">
                          {boughtPlayer.role}
                        </span>
                        {boughtPlayer.isOverseas && (
                          <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[9px] shrink-0 font-bold">
                            ✈️
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-amber-400 shrink-0 ml-2">
                        {formatRupees(amountPaid)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic block py-2 text-center">
                No players purchased yet by {team.shortName}.
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const TeamLiveCard = memo(TeamLiveCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.team.purseRemaining === nextProps.team.purseRemaining &&
    prevProps.team.squad.length === nextProps.team.squad.length &&
    prevProps.isHighBidder === nextProps.isHighBidder &&
    prevProps.isMyFranchise === nextProps.isMyFranchise &&
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.isOverseasAuction === nextProps.isOverseasAuction &&
    prevProps.maxPurse === nextProps.maxPurse &&
    prevProps.team.ownerName === nextProps.team.ownerName &&
    prevProps.soldPlayers.length === nextProps.soldPlayers.length
  );
});
