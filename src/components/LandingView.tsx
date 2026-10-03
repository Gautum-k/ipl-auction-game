'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Plus, LogIn, Shield, Users, Sparkles, Zap, Flame, Loader2 } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { motion } from 'framer-motion';

export const LandingView: React.FC = () => {
  const { createRoom, joinRoom, errorMessage } = useSocket();
  const [tab, setTab] = useState<'CREATE' | 'JOIN'>('CREATE');

  // Create Form State
  const [roomName, setRoomName] = useState("IPL Mega Auction 2026");
  const [hostName, setHostName] = useState('');
  const [mode, setMode] = useState<'MEGA_2025' | 'MINI_2026'>('MEGA_2025');
  const [roomSize, setRoomSize] = useState<number>(10);
  const [timerLength, setTimerLength] = useState<number>(15);
  const [fillWithBots, setFillWithBots] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createTimeoutError, setCreateTimeoutError] = useState<string | null>(null);

  // Join Form State
  const [joinCode, setJoinCode] = useState('');
  const [joinUserName, setJoinUserName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Reset loading state on socket error message
  useEffect(() => {
    if (errorMessage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsCreating(false);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsJoining(false);
    }
  }, [errorMessage]);

  // Auto-fill join code from URL query string ?room=CODE
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setJoinCode(roomParam.toUpperCase());
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTab('JOIN');
      }
    }
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !hostName.trim() || isCreating) return;
    setIsCreating(true);
    setCreateTimeoutError(null);

    createRoom(roomName.trim(), hostName.trim(), mode, roomSize, timerLength, fillWithBots);

    const timer = setTimeout(() => {
      setIsCreating((current) => {
        if (current) {
          setCreateTimeoutError('Room creation timed out. Please check your connection and try again.');
          return false;
        }
        return false;
      });
    }, 5000);

    return () => clearTimeout(timer);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || isJoining) return;
    setIsJoining(true);
    joinRoom(joinCode.trim().toUpperCase(), joinUserName.trim() || undefined);

    const timer = setTimeout(() => {
      setIsJoining(false);
    }, 5000);

    return () => clearTimeout(timer);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 text-white">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-lg shadow-amber-500/10"
        >
          <Sparkles className="w-4 h-4" /> Multi-Player Real-Time IPL Auction Simulator
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-400 bg-clip-text text-transparent"
        >
          IPL Auction Room
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
        >
          Gather your friends, command real IPL franchise purses, exercise Right to Match (RTM) cards, and out-bid each other for legendary IPL superstars!
        </motion.p>
      </div>

      {/* Main Action Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        {/* Tabs */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setTab('CREATE')}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              tab === 'CREATE' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" /> Create Room
          </button>
          <button
            onClick={() => setTab('JOIN')}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              tab === 'JOIN' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" /> Join Room
          </button>
        </div>

        {/* Create Form */}
        {tab === 'CREATE' && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Auction Room Name</label>
              <input
                type="text"
                required
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Gautum's Mega Auction 2026"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Host Manager Name</label>
                <input
                  type="text"
                  required
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="e.g. Gautum"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Auction Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as 'MEGA_2025' | 'MINI_2026')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400 text-sm"
                >
                  <option value="MEGA_2025">Mega Auction (2025)</option>
                  <option value="MINI_2026">Mini Auction (2026)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Franchises (Room Size)</label>
                <select
                  value={roomSize}
                  onChange={(e) => setRoomSize(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400 text-sm"
                >
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num} Teams
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Timer Duration</label>
                <select
                  value={timerLength}
                  onChange={(e) => setTimerLength(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400 text-sm"
                >
                  <option value={10}>10 Seconds (Fast)</option>
                  <option value={15}>15 Seconds (Standard)</option>
                  <option value={20}>20 Seconds (Relaxed)</option>
                  <option value={30}>30 Seconds (Extended)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <input
                type="checkbox"
                id="botCheck"
                checked={fillWithBots}
                onChange={(e) => setFillWithBots(e.target.checked)}
                className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
              />
              <label htmlFor="botCheck" className="text-xs text-slate-300 font-semibold cursor-pointer">
                Fill empty teams with AI Bots (Auto-bidding mode)
              </label>
            </div>

            {createTimeoutError && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300 font-medium">
                {createTimeoutError}
              </div>
            )}

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-xl shadow-amber-500/20 transition transform active:scale-95 text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Auction Room...
                </>
              ) : (
                'Create Auction Room & Launch →'
              )}
            </button>
          </form>
        )}

        {/* Join Form */}
        {tab === 'JOIN' && (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">6-Character Room Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. IPL992"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400 text-center font-mono font-bold text-lg uppercase tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={isJoining}
              className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-xl shadow-amber-500/20 transition transform active:scale-95 text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Entering Arena...
                </>
              ) : (
                'Enter Auction Arena →'
              )}
            </button>
          </form>
        )}
      </motion.div>

      {/* Feature Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 w-fit">
            <Trophy className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-base">₹120 Crore Purses</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Real mega-auction budget allocations with minimum reserve calculators to ensure complete squad building.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
            <Shield className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-base">Right To Match (RTM)</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Authentic RTM cards for original teams to steal back franchise legends right at the hammer drop.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 w-fit">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-base">Crash-Resilient State</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            MongoDB state persistence means auctions automatically rehydrate and resume seamlessly after server restarts.
          </p>
        </div>
      </div>
    </div>
  );
};
