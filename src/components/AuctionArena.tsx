import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Clock,
  Zap,
  Gavel,
  Pause,
  Play,
  Award,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Flame,
  PieChart,
  Landmark,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { formatRupees, getNextMinBid } from '../config/rules';
import { AuctionEngine } from '../engine/auctionEngine';
import { SoldOverlay } from './SoldOverlay';
import { UnsoldOverlay } from './UnsoldOverlay';
import { ReactionChat } from './ReactionChat';
import { Avatar } from './ui/Avatar';
import { CountdownRing } from './ui/CountdownRing';
import confetti from 'canvas-confetti';
import { Player } from '../types';

export const AuctionArena: React.FC = () => {
  const { roomState, socket, isConnected, placeBid, exerciseRtm, togglePause, startAccelerated } = useSocket();
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<'PURSES' | 'SOLD' | 'UNSOLD'>('PURSES');

  if (!roomState || !roomState.currentPlayer) return null;

  const player = roomState.currentPlayer;
  const isHost = socket?.id === roomState.hostSocketId;

  // Find user's claimed team
  const myTeam = useMemo(() => {
    return Object.values(roomState.teams).find((t) => t.ownerSocketId === socket?.id);
  }, [roomState.teams, socket?.id]);

  const minBid = getNextMinBid(roomState.currentBid, player.basePrice);

  // Validation for bid button
  const validationResult = myTeam
    ? AuctionEngine.validateBid(roomState, myTeam.teamId, minBid)
    : { valid: false, reason: 'Must claim a team to bid' };
  const canIBid =
    myTeam &&
    roomState.phase === 'BIDDING' &&
    roomState.highestBidderTeamId !== myTeam.teamId &&
    validationResult.valid;

  // Keyboard shortcut: Spacebar to place minimum bid
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && canIBid && myTeam) {
        e.preventDefault();
        placeBid(roomState.roomCode, myTeam.teamId, minBid);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canIBid, myTeam, minBid, roomState.roomCode, placeBid]);

  // Confetti on SOLD event
  useEffect(() => {
    if (roomState.phase === 'SOLD_PAUSE') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [roomState.phase]);

  const highBidderTeam = roomState.highestBidderTeamId ? roomState.teams[roomState.highestBidderTeamId] : null;
  const originalTeam = player.originalTeamId ? roomState.teams[player.originalTeamId] : null;
  const isRtmOwner = myTeam && player.originalTeamId === myTeam.teamId;

  const lastSoldRecord = roomState.soldPlayers.length > 0 ? roomState.soldPlayers[0] : null;
  const winningTeamForOverlay = lastSoldRecord ? roomState.teams[lastSoldRecord.soldToTeamId] : null;

  // Lookup exact price paid for a bought player
  const getPlayerBoughtAmount = (targetPlayerId: string, fallbackBase: number) => {
    const record = roomState.soldPlayers.find((s) => s.player.id === targetPlayerId);
    return record ? record.amount : fallbackBase;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-white relative">
      {/* Friendly Reconnecting Overlay */}
      {!isConnected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto animate-spin">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white">Reconnecting to Auction Server...</h3>
            <p className="text-xs text-slate-400 max-w-xs">
              Your guest session token will automatically reclaim your seat upon reconnection.
            </p>
          </div>
        </div>
      )}

      {/* Full Screen Sold Celebration Overlay */}
      {roomState.phase === 'SOLD_PAUSE' && lastSoldRecord && winningTeamForOverlay && (
        <SoldOverlay
          player={lastSoldRecord.player}
          winningTeam={winningTeamForOverlay}
          amount={lastSoldRecord.amount}
          isRtm={lastSoldRecord.isRtm}
          bcciWelfareFund={lastSoldRecord.bcciWelfareFund}
        />
      )}

      {/* Full Screen Unsold Overlay */}
      {roomState.phase === 'UNSOLD_PAUSE' && <UnsoldOverlay player={player} />}

      {/* Top Banner: Mode Callout & Official Set Sequence Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          {/* Distinct Auction Mode Badge */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-black tracking-wide flex items-center gap-1.5 shadow-md ${
              roomState.config.mode === 'MEGA_2025'
                ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/40 text-amber-300'
                : 'bg-gradient-to-r from-sky-500/20 via-cyan-500/10 to-sky-500/20 border border-sky-500/40 text-sky-300'
            }`}
          >
            {roomState.config.mode === 'MEGA_2025' ? '⚡ MEGA AUCTION (2025)' : '🚀 MINI AUCTION (2026)'}
          </div>

          {/* Official Auction Set Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>SET {player.setNumber} OF 8:</span>
            <span className="text-amber-400 font-extrabold">{player.setName}</span>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Player {roomState.currentPlayerIndex + 1} of {roomState.playerPool.length}
          </span>
        </div>

        {/* Host Controls */}
        {isHost && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => togglePause(roomState.roomCode)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {roomState.phase === 'PAUSED' ? (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" /> Resume Auction
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" /> Pause Auction
                </>
              )}
            </button>

            {roomState.unsoldPlayers.length > 0 && (
              <button
                onClick={() => startAccelerated(roomState.roomCode)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Accelerated Round
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Player Spotlight & Bidding Console */}
        <div className="lg:col-span-7 space-y-6">
          {/* Spotlight Card */}
          <div className="relative rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Player Avatar & Monogram */}
              <div className="md:col-span-5 flex flex-col items-center justify-center text-center space-y-4">
                <Avatar name={player.name} size="xl" />

                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{player.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold">
                      {player.role}
                    </span>
                    {player.isOverseas && (
                      <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
                        ✈️ Overseas
                      </span>
                    )}
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-300 font-medium">{player.country}</span>
                  </div>
                </div>
              </div>

              {/* Stats & Current Bid Info */}
              <div className="md:col-span-7 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Base Reserve Price</span>
                    <p className="text-xl font-bold text-amber-400">{formatRupees(player.basePrice)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Previous Team</span>
                    <p className="text-sm font-bold text-slate-200">{originalTeam ? originalTeam.shortName : 'None'}</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="block text-[11px] text-slate-400">IPL Matches</span>
                    <span className="font-bold text-sm text-white">{player.stats.matches}</span>
                  </div>

                  {player.stats.runs !== undefined && (
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="block text-[11px] text-slate-400">Runs</span>
                      <span className="font-bold text-sm text-white">{player.stats.runs}</span>
                    </div>
                  )}

                  {player.stats.wickets !== undefined && (
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="block text-[11px] text-slate-400">Wickets</span>
                      <span className="font-bold text-sm text-white">{player.stats.wickets}</span>
                    </div>
                  )}

                  {player.stats.strikeRate !== undefined && (
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="block text-[11px] text-slate-400">Strike Rate</span>
                      <span className="font-bold text-sm text-amber-400">{player.stats.strikeRate}</span>
                    </div>
                  )}
                </div>

                {/* Current Bid & Countdown Ring */}
                <div className="relative rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 p-4 flex items-center justify-between shadow-inner">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Current High Bid</span>
                    <p className="text-3xl font-black text-amber-400">
                      {roomState.currentBid > 0 ? formatRupees(roomState.currentBid) : 'No Bids Yet'}
                    </p>
                  </div>

                  <CountdownRing secondsLeft={roomState.timer.secondsLeft} duration={roomState.timer.duration} size={64} />
                </div>

                {highBidderTeam && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    <Gavel className="w-4 h-4" />
                    <span>Highest Bidder: {highBidderTeam.teamName} ({highBidderTeam.ownerName})</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Bidding Control Console */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Real-Time Bidding Console
              </h4>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">Press [SPACE] to bid</span>
            </div>

            {myTeam ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>
                    Your Franchise: <strong className="text-amber-400">{myTeam.teamName}</strong> ({myTeam.shortName})
                  </span>
                  <span>
                    Purse Remaining: <strong className="text-emerald-400">{formatRupees(myTeam.purseRemaining)}</strong>
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: canIBid ? 1.01 : 1 }}
                  whileTap={{ scale: canIBid ? 0.98 : 1 }}
                  disabled={!canIBid}
                  onClick={() => placeBid(roomState.roomCode, myTeam.teamId, minBid)}
                  className={`w-full py-4 rounded-2xl font-black text-lg sm:text-xl transition-all shadow-xl flex items-center justify-center gap-3 ${
                    canIBid
                      ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-amber-500/20 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Gavel className="w-6 h-6 stroke-[2.5]" />
                  {roomState.highestBidderTeamId === myTeam.teamId
                    ? 'Your Team Holds Highest Bid'
                    : canIBid
                    ? `BID ${formatRupees(minBid)}`
                    : validationResult.reason || 'Bidding Disabled'}
                </motion.button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                You must claim a franchise team in the room lobby to place bids!
              </div>
            )}
          </div>

          <ReactionChat />
        </div>

        {/* Right 5 Cols: Franchises Purses, Bought Players with Amounts & Tracker Tabs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-xl">
            {/* Header Tabs: Franchises Purses | Sold Players | Unsold Players */}
            <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setRightPanelTab('PURSES')}
                className={`py-2 rounded-lg transition text-center ${
                  rightPanelTab === 'PURSES' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Purses ({Object.keys(roomState.teams).length})
              </button>
              <button
                onClick={() => setRightPanelTab('SOLD')}
                className={`py-2 rounded-lg transition text-center ${
                  rightPanelTab === 'SOLD' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sold ({roomState.soldPlayers.length})
              </button>
              <button
                onClick={() => setRightPanelTab('UNSOLD')}
                className={`py-2 rounded-lg transition text-center ${
                  rightPanelTab === 'UNSOLD' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Unsold ({roomState.unsoldPlayers.length})
              </button>
            </div>

            {/* TAB 1: Franchises Purses & Expandable Purchased Roster with Prices */}
            {rightPanelTab === 'PURSES' && (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {Object.values(roomState.teams).map((team) => {
                  const isHighBidder = roomState.highestBidderTeamId === team.teamId;
                  const isMyFranchise = myTeam?.teamId === team.teamId;
                  const isExpanded = expandedTeamId === team.teamId;

                  const batCount = team.squad.filter((p) => p.role === 'BATTER').length;
                  const bowlCount = team.squad.filter((p) => p.role === 'BOWLER').length;
                  const arCount = team.squad.filter((p) => p.role === 'ALL_ROUNDER').length;
                  const wkCount = team.squad.filter((p) => p.role === 'WICKETKEEPER').length;
                  const overseasCount = team.squad.filter((p) => p.isOverseas).length;

                  return (
                    <div
                      key={team.teamId}
                      className={`rounded-2xl border text-xs overflow-hidden transition ${
                        isHighBidder
                          ? 'bg-amber-500/10 border-amber-500/50 shadow-sm'
                          : isMyFranchise
                          ? 'bg-slate-900 border-amber-400/40 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/80'
                      }`}
                    >
                      {/* Franchise Row Card */}
                      <div
                        onClick={() => setExpandedTeamId(isExpanded ? null : team.teamId)}
                        className="p-3.5 cursor-pointer hover:bg-slate-800/50 transition flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{team.shortName}</span>
                            {isMyFranchise && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px]">
                                MY TEAM
                              </span>
                            )}
                            {team.ownerName && (
                              <span className="text-[11px] text-slate-400 font-normal">({team.ownerName})</span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block">
                            Squad: {team.squad.length} / 25 • Overseas: {overseasCount}/8
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="font-mono font-bold text-emerald-400 text-sm block">
                              {formatRupees(team.purseRemaining)}
                            </span>
                            <span className="text-[10px] text-slate-400">Purse Left</span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>

                      {/* Squad Balance Strip */}
                      <div className="grid grid-cols-5 gap-1 text-[10px] text-center p-2 bg-slate-950/80 border-t border-slate-800/60">
                        <div className="p-1 rounded bg-slate-900 text-slate-300">
                          <span className="block text-slate-400">BAT</span>
                          <span className="font-bold">{batCount}</span>
                        </div>
                        <div className="p-1 rounded bg-slate-900 text-slate-300">
                          <span className="block text-slate-400">BOWL</span>
                          <span className="font-bold">{bowlCount}</span>
                        </div>
                        <div className="p-1 rounded bg-slate-900 text-slate-300">
                          <span className="block text-slate-400">AR</span>
                          <span className="font-bold">{arCount}</span>
                        </div>
                        <div className="p-1 rounded bg-slate-900 text-slate-300">
                          <span className="block text-slate-400">WK</span>
                          <span className="font-bold">{wkCount}</span>
                        </div>
                        <div className="p-1 rounded bg-slate-900 text-sky-400 font-bold">
                          <span className="block text-slate-400">OVS</span>
                          <span>{overseasCount}/8</span>
                        </div>
                      </div>

                      {/* Expandable Purchased Players List with Amounts */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="p-3 bg-slate-900/90 border-t border-slate-800 space-y-2"
                          >
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                              Purchased Players Roster ({team.squad.length})
                            </span>

                            {team.squad.length > 0 ? (
                              <div className="space-y-1.5">
                                {team.squad.map((boughtPlayer, idx) => {
                                  const amountPaid = getPlayerBoughtAmount(boughtPlayer.id, boughtPlayer.basePrice);
                                  return (
                                    <div
                                      key={boughtPlayer.id}
                                      className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px]"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-slate-400 font-mono">{idx + 1}.</span>
                                        <span className="font-bold text-white">{boughtPlayer.name}</span>
                                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                                          {boughtPlayer.role}
                                        </span>
                                      </div>
                                      <span className="font-mono font-bold text-amber-400">
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
                })}
              </div>
            )}

            {/* TAB 2: Sold Players Feed */}
            {rightPanelTab === 'SOLD' && (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {roomState.soldPlayers.length > 0 ? (
                  roomState.soldPlayers.map((soldRecord, idx) => {
                    const buyerTeam = roomState.teams[soldRecord.soldToTeamId];
                    return (
                      <div
                        key={`${soldRecord.player.id}-${idx}`}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{soldRecord.player.name}</span>
                            {soldRecord.isRtm && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px]">
                                RTM
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                            <span>Bought by <strong className="text-emerald-400">{buyerTeam?.teamName || soldRecord.soldToTeamId}</strong></span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-black text-amber-400 text-sm block">
                            {formatRupees(soldRecord.amount)}
                          </span>
                          {soldRecord.bcciWelfareFund && soldRecord.bcciWelfareFund > 0 && (
                            <span className="text-[10px] text-rose-400 block font-semibold">
                              (Cap Surplus: {formatRupees(soldRecord.bcciWelfareFund)})
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    No players have been sold yet in this auction.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Unsold Players Feed */}
            {rightPanelTab === 'UNSOLD' && (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {roomState.unsoldPlayers.length > 0 ? (
                  roomState.unsoldPlayers.map((unsoldPlayer) => (
                    <div
                      key={unsoldPlayer.id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs opacity-80 hover:opacity-100 transition"
                    >
                      <div>
                        <span className="font-bold text-white text-sm block">{unsoldPlayer.name}</span>
                        <span className="text-slate-400 text-[11px]">
                          {unsoldPlayer.role} • {unsoldPlayer.setName}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-300 block">
                          Base: {formatRupees(unsoldPlayer.basePrice)}
                        </span>
                        <span className="text-[10px] text-amber-400 font-semibold">Available in Accelerated</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    No unsold players yet!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RTM Modal Dialog */}
      {roomState.phase === 'RTM_PENDING' && isRtmOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 p-6 rounded-3xl space-y-6 text-white shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Right To Match (RTM) Opportunity!</h3>
                <p className="text-xs text-slate-400">
                  {player.name} originally belonged to your team ({myTeam.shortName}).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400">Highest Bid to Match</span>
              <p className="text-3xl font-black text-amber-400">{formatRupees(roomState.rtmAskingBid || 0)}</p>
              <p className="text-xs text-slate-400">
                You have <strong>{myTeam.rtmRemaining} RTM card(s)</strong> remaining.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => exerciseRtm(roomState.roomCode, myTeam.teamId, 'DECLINE')}
                className="py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Decline RTM
              </button>
              <button
                onClick={() => exerciseRtm(roomState.roomCode, myTeam.teamId, 'ACCEPT')}
                className="py-3 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 transition shadow-lg shadow-amber-500/20"
              >
                Match Bid & Buy Player
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

