'use client';

import React from 'react';
import { useSocket } from '../context/SocketContext';
import { LandingView } from '../components/LandingView';
import { LobbyView } from '../components/LobbyView';
import { AuctionArena } from '../components/AuctionArena';
import { PostAuctionDashboard } from '../components/PostAuctionDashboard';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

export default function Home() {
  const { roomState, errorMessage, clearError, isRehydrating } = useSocket();

  return (
    <div className="min-h-screen flex flex-col justify-between relative bg-slate-950 text-white">
      {/* Error Toast Notification */}
      {errorMessage && (
        <div className="fixed top-16 right-4 z-50 max-w-sm bg-rose-950 border border-rose-800 text-rose-200 p-4 rounded-2xl shadow-2xl flex items-start justify-between gap-3 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="text-xs font-semibold">{errorMessage}</span>
          </div>
          <button onClick={clearError} className="p-1 hover:bg-rose-900 rounded-lg text-rose-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main View Router based on Room Phase */}
      <main className="flex-1">
        {isRehydrating ? (
          <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center gap-3 text-center max-w-xs">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <div>
                <p className="text-sm font-bold text-white">Reconnecting to Auction Arena</p>
                <p className="text-xs text-slate-400 mt-1">Rehydrating your live auction room state...</p>
              </div>
            </div>
          </div>
        ) : !roomState ? (
          <LandingView />
        ) : roomState.phase === 'LOBBY' ? (
          <LobbyView />
        ) : roomState.phase === 'COMPLETED' ? (
          <PostAuctionDashboard />
        ) : (
          <AuctionArena />
        )}
      </main>
    </div>
  );
}
