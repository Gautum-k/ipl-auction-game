'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ChevronDown, ChevronUp, User, Radio } from 'lucide-react';
import { Player } from '../types';
import { formatRupees } from '../config/rules';

interface UpcomingQueuePanelProps {
  playerPool: Player[];
  currentPlayerIndex: number;
}

export const UpcomingQueuePanel: React.FC<UpcomingQueuePanelProps> = ({
  playerPool,
  currentPlayerIndex,
}) => {
  const [expandedSetNumber, setExpandedSetNumber] = useState<number | null>(null);

  // 1. Immediate Queue: next 5 to 10 players coming up in order
  const immediateQueue = useMemo(() => {
    return playerPool.slice(currentPlayerIndex + 1, currentPlayerIndex + 11);
  }, [playerPool, currentPlayerIndex]);

  // 2. Remaining sets list: all upcoming sets after current player
  const upcomingSetsGrouped = useMemo(() => {
    const remainingPlayers = playerPool.slice(currentPlayerIndex + 1);
    const setMap = new Map<number, { setNumber: number; setName: string; players: Player[] }>();

    remainingPlayers.forEach((p) => {
      if (!setMap.has(p.setNumber)) {
        setMap.set(p.setNumber, {
          setNumber: p.setNumber,
          setName: p.setName,
          players: [],
        });
      }
        setMap.get(p.setNumber)!.players.push(p);
    });

    return Array.from(setMap.values());
  }, [playerPool, currentPlayerIndex]);

  const nextUpPlayer = immediateQueue[0];

  return (
    <div className="space-y-4 text-xs">
      {/* Broadcast Commentary Banner */}
      {nextUpPlayer && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-3 shadow-md">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 animate-pulse">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-amber-400/80 font-bold block">
              Broadcast Preview • Up Next
            </span>
            <p className="font-bold text-white text-sm">
              &quot;Up next is <span className="text-amber-300 font-black">{nextUpPlayer.name}</span> ({nextUpPlayer.role} • {nextUpPlayer.country}) — Base {formatRupees(nextUpPlayer.basePrice)}&quot;
            </p>
          </div>
        </div>
      )}

      {/* Immediate Queue: Next 5-10 Players */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-sky-400" /> Immediate Queue (Next {immediateQueue.length})
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">Order of arrival</span>
        </div>

        {immediateQueue.length > 0 ? (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {immediateQueue.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="font-bold text-white truncate block">{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {p.role} • {p.setName}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className="font-mono font-bold text-amber-400 block">{formatRupees(p.basePrice)}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                    {p.isOverseas ? (
                      <span className="text-sky-300 font-semibold">✈️ {p.country}</span>
                    ) : (
                      <span>🇮🇳 India</span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-slate-500 italic block py-2 text-center">
            No further players in the queue!
          </span>
        )}
      </div>

      {/* Upcoming Sets List: Scrollable list of every remaining set */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" /> All Upcoming Sets ({upcomingSetsGrouped.length})
          </h4>
          <span className="text-[10px] text-slate-400">Tap set to expand roster</span>
        </div>

        {upcomingSetsGrouped.length > 0 ? (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {upcomingSetsGrouped.map((setGroup) => {
              const isExpanded = expandedSetNumber === setGroup.setNumber;
              return (
                <div
                  key={setGroup.setNumber}
                  className="rounded-xl border border-slate-800/80 bg-slate-900 overflow-hidden transition"
                >
                  <button
                    onClick={() => setExpandedSetNumber(isExpanded ? null : setGroup.setNumber)}
                    className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-800/50 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] shrink-0">
                        SET {setGroup.setNumber}
                      </span>
                      <span className="font-bold text-white truncate">{setGroup.setName}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {setGroup.players.length} player{setGroup.players.length !== 1 ? 's' : ''}
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="p-3 bg-slate-950/90 border-t border-slate-800 space-y-1.5"
                      >
                        {setGroup.players.map((player) => (
                          <div
                            key={player.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800/60 text-[11px]"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-semibold text-slate-200 truncate">{player.name}</span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px]">
                                {player.role}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 font-mono">
                              <span className="text-slate-400 text-[10px]">
                                {player.isOverseas ? `✈️ ${player.country}` : `🇮🇳 ${player.country}`}
                              </span>
                              <span className="font-bold text-amber-400">{formatRupees(player.basePrice)}</span>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : (
          <span className="text-slate-500 italic block py-2 text-center">
            No remaining sets to display.
          </span>
        )}
      </div>
    </div>
  );
};
