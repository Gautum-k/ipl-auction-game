'use client';

import { Copy, Volume2, VolumeX, ShieldCheck, Trophy, HelpCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { soundManager } from '../lib/sound';
import { RulesModal } from './RulesModal';

export const Header: React.FC = () => {
  const { isConnected, roomState } = useSocket();
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);
  const [showRules, setShowRules] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleMute = () => {
    soundManager.isMuted = !soundManager.isMuted;
    setIsMuted(soundManager.isMuted);
  };

  const copyRoomCode = () => {
    if (!roomState?.roomCode) return;
    navigator.clipboard.writeText(roomState.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 text-white px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Trophy className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-400 bg-clip-text text-transparent">
                IPL Auction Room
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Official Engine
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500'
                    }`}
                  />
                  {isConnected ? 'Live' : 'Connecting...'}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Room Code Badge & Mode Callout (when inside room) */}
          {roomState && (
            <div className="hidden md:flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-black tracking-wide flex items-center gap-1.5 shadow-md ${
                roomState.config.mode === 'MEGA_2025'
                  ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/40 text-amber-300'
                  : 'bg-gradient-to-r from-sky-500/20 via-cyan-500/10 to-sky-500/20 border border-sky-500/40 text-sky-300'
              }`}>
                {roomState.config.mode === 'MEGA_2025' ? '⚡ MEGA AUCTION (2025)' : '🚀 MINI AUCTION (2026)'}
              </div>

              <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/30 px-3.5 py-1.5 rounded-full shadow-inner">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Room Code:</span>
                <span className="font-mono font-bold text-amber-400 tracking-wider text-sm">
                  {roomState.roomCode}
                </span>
                <button
                  onClick={copyRoomCode}
                  className="ml-1 p-1 hover:bg-slate-800 rounded-md transition text-slate-300 hover:text-amber-300"
                  title="Copy Room Code"
                  aria-label="Copy Room Code"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copied && <span className="text-[10px] text-emerald-400 font-semibold px-1">Copied!</span>}
              </div>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowRules(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 rounded-lg transition"
              aria-label="View IPL Auction Rules"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Rules</span>
            </button>

            <button
              onClick={toggleMute}
              className="p-2 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 rounded-lg transition"
              title={isMuted ? 'Unmute SFX' : 'Mute SFX'}
              aria-label={isMuted ? 'Unmute SFX' : 'Mute SFX'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>
      </header>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </>
  );
};
