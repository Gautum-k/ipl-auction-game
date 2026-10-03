'use client';

import React, { useState } from 'react';
import { Shield, Play, Users, CheckCircle2, UserCheck, Copy, Sparkles } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { IPL_RULES } from '../config/rules';
import { motion } from 'framer-motion';

export const LobbyView: React.FC = () => {
  const { roomState, socket, claimTeam, unclaimTeam, startAuction } = useSocket();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [ownerNameInput, setOwnerNameInput] = useState('');
  const [copied, setCopied] = useState(false);

  if (!roomState) return null;

  const isHost = socket?.id === roomState.hostSocketId;
  const claimedCount = Object.values(roomState.teams).filter((t) => t.ownerSocketId !== null).length;

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId || !ownerNameInput.trim()) return;
    claimTeam(roomState.roomCode, selectedTeamId, ownerNameInput.trim());
    setSelectedTeamId(null);
    setOwnerNameInput('');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomState.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-white">
      {/* Lobby Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> IPL Mega Auction Room
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {roomState.roomName}
            </h2>
            <p className="text-sm text-slate-400">
              Select your franchise to command a ₹120 Crore budget in real-time bidding!
            </p>
          </div>

          {/* Room Code Callout */}
          <div className="flex flex-col items-start md:items-end gap-2 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-inner min-w-[220px]">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Room Code</span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-black tracking-wider text-amber-400">
                {roomState.roomCode}
              </span>
              <button
                onClick={copyCode}
                className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition"
                title="Copy Room Code"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {copied && <span className="text-xs text-emerald-400 font-semibold">Code Copied to Clipboard!</span>}
          </div>
        </div>
      </div>

      {/* Team Selection Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" /> Franchises ({claimedCount}/10 Claimed)
            </h3>
            <p className="text-xs text-slate-400">Click an available team to claim ownership</p>
          </div>
        </div>

        {/* 10 Team Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {IPL_RULES.teamOptions.map((teamConfig) => {
            const teamState = roomState.teams[teamConfig.id];
            const isOwned = teamState?.ownerSocketId !== null;
            const isMyTeam = teamState?.ownerSocketId === socket?.id;

            return (
              <motion.div
                key={teamConfig.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative rounded-2xl p-5 border transition-all flex flex-col justify-between overflow-hidden shadow-lg ${
                  isMyTeam
                    ? 'bg-slate-900 border-amber-400 shadow-amber-500/20'
                    : isOwned
                    ? 'bg-slate-900/60 border-slate-800 opacity-90'
                    : 'bg-slate-900/40 hover:bg-slate-900/80 border-slate-800/80 hover:border-slate-700 cursor-pointer'
                }`}
                style={{
                  borderTopColor: teamConfig.primaryColor,
                  borderTopWidth: '4px',
                }}
                onClick={() => {
                  if (!isOwned) {
                    setSelectedTeamId(teamConfig.id);
                  }
                }}
              >
                {/* Team Badge Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-lg text-white tracking-wide">{teamConfig.shortName}</span>
                    {isOwned ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Taken
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Available
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs text-slate-300 font-medium line-clamp-1">{teamConfig.name}</h4>
                </div>

                {/* Owner Status */}
                <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  {isOwned ? (
                    <div className="flex items-center gap-2 text-slate-300">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold truncate max-w-[120px]">{teamState.ownerName}</span>
                    </div>
                  ) : (
                    <span className="text-amber-400 font-semibold text-[11px]">Click to Claim →</span>
                  )}

                  {isMyTeam && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        unclaimTeam(roomState.roomCode, teamConfig.id);
                      }}
                      className="text-[10px] text-rose-400 hover:underline"
                    >
                      Release
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Host Controls Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl bg-slate-900/80 border border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-amber-400" />
          <div>
            <h4 className="font-bold text-white text-sm sm:text-base">Host Control Center</h4>
            <p className="text-xs text-slate-400">
              {isHost ? 'You are the Auctioneer (Host).' : 'Waiting for host to initiate the Mega Auction...'}
            </p>
          </div>
        </div>

        {isHost && (
          <button
            onClick={() => startAuction(roomState.roomCode)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-xl shadow-amber-500/25 transition transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-slate-950" /> Start Mega Auction
          </button>
        )}
      </div>

      {/* Claim Modal */}
      {selectedTeamId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 text-white shadow-2xl">
            <h3 className="text-lg font-bold">
              Claim Franchise:{' '}
              <span className="text-amber-400">
                {IPL_RULES.teamOptions.find((t) => t.id === selectedTeamId)?.name}
              </span>
            </h3>
            <form onSubmit={handleClaim} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Your Owner / Manager Name</label>
                <input
                  type="text"
                  required
                  value={ownerNameInput}
                  onChange={(e) => setOwnerNameInput(e.target.value)}
                  placeholder="e.g. Gautum, Rohit, Nita"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400 text-sm"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTeamId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl font-bold"
                >
                  Claim Franchise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
