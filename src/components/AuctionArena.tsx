'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Zap,
  Gavel,
  Pause,
  Play,
  Award,
  Flame,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { formatRupees, getNextMinBid, IPL_RULES, MEGA_MODE_RULES, MINI_MODE_RULES } from '../config/rules';
import { AuctionEngine } from '../engine/auctionEngine';
import { SoldOverlay } from './SoldOverlay';
import { UnsoldOverlay } from './UnsoldOverlay';
import { ReactionChat } from './ReactionChat';
import { TeamLiveCard } from './TeamLiveCard';
import { UpcomingQueuePanel } from './UpcomingQueuePanel';
import { MyTeamPanel } from './MyTeamPanel';
import { AccelNominationView } from './AccelNominationView';
import { Avatar } from './ui/Avatar';
import { CountdownRing } from './ui/CountdownRing';
import confetti from 'canvas-confetti';

export const AuctionArena: React.FC = () => {
  const { roomState, socket, isConnected, placeBid, exerciseRtm, togglePause, startAccelerated } = useSocket();
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<'PURSES' | 'MY_TEAM' | 'UPCOMING' | 'SOLD' | 'UNSOLD'>('PURSES');

  // Find user's claimed team
  const myTeam = useMemo(() => {
    if (!roomState) return null;
    return Object.values(roomState.teams).find((t) => t.ownerSocketId === socket?.id);
  }, [roomState, socket?.id]);

  const player = roomState?.currentPlayer;
  const isHost = socket?.id === roomState?.hostSocketId;
  const currentModeRules = roomState?.config.mode === 'MEGA_2025' ? MEGA_MODE_RULES : MINI_MODE_RULES;

  // Overseas counts for user's team
  const myTeamOverseasCount = myTeam ? myTeam.squad.filter((p) => p.isOverseas).length : 0;
  const myTeamOverseasLeft = 8 - myTeamOverseasCount;
  const isOverseasLimitReached = player?.isOverseas && myTeamOverseasLeft === 0;

  const minBid = player ? getNextMinBid(roomState.currentBid, player.basePrice, currentModeRules) : 0;

  // Validation for bid button
  const rawValidation = useMemo(() => {
    if (!roomState || !myTeam) return { valid: false, reason: 'Must claim a team to bid' };
    return AuctionEngine.validateBid(roomState, myTeam.teamId, minBid);
  }, [roomState, myTeam, minBid]);

  // Overseas slot override warning if 0 left
  const validationResult = isOverseasLimitReached
    ? { valid: false, reason: 'Overseas limit reached (8/8 used)' }
    : rawValidation;

  const canIBid =
    myTeam &&
    roomState?.phase === 'BIDDING' &&
    roomState.highestBidderTeamId !== myTeam.teamId &&
    validationResult.valid;

  // Keyboard shortcut: Spacebar to place minimum bid
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && canIBid && myTeam && roomState) {
        e.preventDefault();
        placeBid(roomState.roomCode, myTeam.teamId, minBid);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canIBid, myTeam, minBid, roomState, placeBid]);

  // Confetti on SOLD event
  useEffect(() => {
    if (roomState?.phase === 'SOLD_PAUSE') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [roomState?.phase]);

  if (roomState?.phase === 'ACCEL_NOMINATION') {
    return <AccelNominationView />;
  }

  if (!roomState || !roomState.currentPlayer) return null;

  const activePlayer = roomState.currentPlayer;
  const highBidderTeam = roomState.highestBidderTeamId ? roomState.teams[roomState.highestBidderTeamId] : null;
  const leadingTeamConfig = highBidderTeam
    ? IPL_RULES.teamOptions.find((t) => t.id === highBidderTeam.teamId)
    : null;
  const leadingColor = leadingTeamConfig?.primaryColor || '#F59E0B';

  const originalTeam = activePlayer.originalTeamId ? roomState.teams[activePlayer.originalTeamId] : null;
  const isRtmOwner = myTeam && activePlayer.originalTeamId === myTeam.teamId;

  const lastSoldRecord = roomState.soldPlayers.length > 0 ? roomState.soldPlayers[0] : null;
  const winningTeamForOverlay = lastSoldRecord ? roomState.teams[lastSoldRecord.soldToTeamId] : null;

  const myTeamColorConfig = myTeam ? IPL_RULES.teamOptions.find((t) => t.id === myTeam.teamId) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-white relative">
      {/* Reconnecting Overlay */}
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
      {roomState.phase === 'UNSOLD_PAUSE' && <UnsoldOverlay player={activePlayer} />}

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
            <span>SET {activePlayer.setNumber}:</span>
            <span className="text-amber-400 font-extrabold">{activePlayer.setName}</span>
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
                <Avatar name={activePlayer.name} size="xl" />

                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{activePlayer.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-xs flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold">
                      {activePlayer.role}
                    </span>
                    {activePlayer.isOverseas && (
                      <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                        ✈️ Overseas
                      </span>
                    )}
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-300 font-medium">{activePlayer.country}</span>
                  </div>
                </div>

                {/* Bidding-time Overseas Slot Indicator on Spotlight Card */}
                {activePlayer.isOverseas && myTeam && (
                  <div
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                      myTeamOverseasLeft === 0
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                    }`}
                  >
                    {myTeamOverseasLeft === 0 ? <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> : null}
                    <span>
                      Overseas: <strong className="underline">{myTeamOverseasCount}/8 used</strong>
                      {myTeamOverseasLeft === 0 ? ' (0 slots left — Bidding Blocked)' : ` (${myTeamOverseasLeft} left)`}
                    </span>
                  </div>
                )}
              </div>

              {/* Stats & Current Bid Info */}
              <div className="md:col-span-7 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Base Reserve Price</span>
                    <p className="text-xl font-bold text-amber-400">{formatRupees(activePlayer.basePrice)}</p>
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
                    <span className="font-bold text-sm text-white">{activePlayer.stats.matches}</span>
                  </div>

                  {activePlayer.stats.runs !== undefined && (
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="block text-[11px] text-slate-400">Runs</span>
                      <span className="font-bold text-sm text-white">{activePlayer.stats.runs}</span>
                    </div>
                  )}

                  {activePlayer.stats.wickets !== undefined && (
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="block text-[11px] text-slate-400">Wickets</span>
                      <span className="font-bold text-sm text-white">{activePlayer.stats.wickets}</span>
                    </div>
                  )}

                  {activePlayer.stats.strikeRate !== undefined && (
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="block text-[11px] text-slate-400">Strike Rate</span>
                      <span className="font-bold text-sm text-amber-400">{activePlayer.stats.strikeRate}</span>
                    </div>
                  )}
                </div>

                {/* Requirement 8: Live Bid-Leader Animated Container (Color Tweening + Directional Slide + Pulse) */}
                <motion.div
                  animate={{
                    backgroundColor: highBidderTeam ? `${leadingColor}18` : 'rgba(2, 6, 23, 0.8)',
                    borderColor: highBidderTeam ? `${leadingColor}70` : 'rgba(245, 158, 11, 0.3)',
                    boxShadow: highBidderTeam ? `0 0 24px ${leadingColor}30` : 'none',
                  }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="relative rounded-2xl border p-4 flex items-center justify-between shadow-inner"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Current High Bid</span>
                      {/* Leading Team Logo / Short Name Badge */}
                      {highBidderTeam && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shadow-sm transition-all"
                          style={{ backgroundColor: leadingColor, color: '#0F172A' }}
                        >
                          {highBidderTeam.shortName} LEADING
                        </span>
                      )}
                    </div>

                    {/* Animated Bid Amount (Pulse + Directional Slide/Fade) */}
                    <div className="h-10 flex items-center overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={roomState.currentBid}
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: [1, 1.1, 1] }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.22, ease: 'easeOut' }}
                          className="text-3xl font-black font-mono block"
                          style={{ color: highBidderTeam ? leadingColor : '#F59E0B' }}
                        >
                          {roomState.currentBid > 0 ? formatRupees(roomState.currentBid) : 'No Bids Yet'}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>

                  <CountdownRing secondsLeft={roomState.timer.secondsLeft} duration={roomState.timer.duration} size={64} />
                </motion.div>

                {highBidderTeam && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    <Gavel className="w-4 h-4" />
                    <span>Highest Bidder: {highBidderTeam.teamName} ({highBidderTeam.ownerName || 'User'})</span>
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
                <div className="flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
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

        {/* Right 5 Cols: Strategic Tabbed Panel (Purses | My Team | Up Next | Sold | Unsold) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-xl">
            {/* Strategy Header Tabs */}
            <div className="grid grid-cols-5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-bold gap-0.5">
              <button
                onClick={() => setRightPanelTab('PURSES')}
                className={`py-2 rounded-lg transition text-center truncate ${
                  rightPanelTab === 'PURSES' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Purses ({Object.keys(roomState.teams).length})
              </button>
              <button
                onClick={() => setRightPanelTab('MY_TEAM')}
                className={`py-2 rounded-lg transition text-center truncate ${
                  rightPanelTab === 'MY_TEAM' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                My Team
              </button>
              <button
                onClick={() => setRightPanelTab('UPCOMING')}
                className={`py-2 rounded-lg transition text-center truncate ${
                  rightPanelTab === 'UPCOMING' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Up Next
              </button>
              <button
                onClick={() => setRightPanelTab('SOLD')}
                className={`py-2 rounded-lg transition text-center truncate ${
                  rightPanelTab === 'SOLD' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sold ({roomState.soldPlayers.length})
              </button>
              <button
                onClick={() => setRightPanelTab('UNSOLD')}
                className={`py-2 rounded-lg transition text-center truncate ${
                  rightPanelTab === 'UNSOLD' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Unsold ({roomState.unsoldPlayers.length})
              </button>
            </div>

            {/* TAB 1: All-Teams Live Panel with Scoped Updates */}
            {rightPanelTab === 'PURSES' && (
              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                {Object.values(roomState.teams).map((team) => {
                  const isHighBidder = roomState.highestBidderTeamId === team.teamId;
                  const isMyFranchise = myTeam?.teamId === team.teamId;
                  const isExpanded = expandedTeamId === team.teamId;
                  const teamConfig = IPL_RULES.teamOptions.find((t) => t.id === team.teamId);

                  return (
                    <TeamLiveCard
                      key={team.teamId}
                      team={team}
                      maxPurse={currentModeRules.maxPursePerTeam}
                      isMyFranchise={isMyFranchise}
                      isHighBidder={isHighBidder}
                      isExpanded={isExpanded}
                      onToggleExpand={() => setExpandedTeamId(isExpanded ? null : team.teamId)}
                      soldPlayers={roomState.soldPlayers}
                      isOverseasAuction={activePlayer.isOverseas}
                      primaryColor={teamConfig?.primaryColor}
                      secondaryColor={teamConfig?.secondaryColor}
                    />
                  );
                })}
              </div>
            )}

            {/* TAB 2: Dedicated "My Team" Strategic View */}
            {rightPanelTab === 'MY_TEAM' && (
              <div className="max-h-[560px] overflow-y-auto pr-1">
                <MyTeamPanel
                  myTeam={myTeam || null}
                  maxPurse={currentModeRules.maxPursePerTeam}
                  soldPlayers={roomState.soldPlayers}
                  mode={roomState.config.mode}
                  teamColor={myTeamColorConfig?.primaryColor}
                />
              </div>
            )}

            {/* TAB 3: Upcoming Queue & Sets Preview */}
            {rightPanelTab === 'UPCOMING' && (
              <div className="max-h-[560px] overflow-y-auto pr-1">
                <UpcomingQueuePanel
                  playerPool={roomState.playerPool}
                  currentPlayerIndex={roomState.currentPlayerIndex}
                />
              </div>
            )}

            {/* TAB 4: Sold Players Feed */}
            {rightPanelTab === 'SOLD' && (
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
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

            {/* TAB 5: Unsold Players Feed */}
            {rightPanelTab === 'UNSOLD' && (
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
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
                  {activePlayer.name} originally belonged to your team ({myTeam.shortName}).
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
