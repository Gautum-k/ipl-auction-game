'use client';

import React from 'react';
import { useSocket } from '../context/SocketContext';
import { LandingView } from '../components/LandingView';
import { LobbyView } from '../components/LobbyView';
import { AuctionArena } from '../components/AuctionArena';
import { PostAuctionDashboard } from '../components/PostAuctionDashboard';
import { AlertTriangle, X } from 'lucide-react';

export default function Home() {
  const { roomState, errorMessage, clearError } = useSocket();

  return (
    <div className="min-h-screen flex flex-col justify-between relative">
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
        {!roomState ? (
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
