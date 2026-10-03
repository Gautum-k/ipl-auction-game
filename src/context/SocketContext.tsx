'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getOrCreateSessionToken } from '../lib/session';
import { soundManager } from '../lib/sound';
import { AuctionRoomState } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  roomState: AuctionRoomState | null;
  errorMessage: string | null;
  clearError: () => void;
  createRoom: (
    roomName: string,
    hostName: string,
    mode?: 'MEGA_2025' | 'MINI_2026',
    roomSize?: number,
    timerLength?: number,
    fillWithBots?: boolean
  ) => void;
  joinRoom: (roomCode: string, userName?: string) => void;
  claimTeam: (roomCode: string, teamId: string, ownerName: string) => void;
  unclaimTeam: (roomCode: string, teamId: string) => void;
  startAuction: (roomCode: string) => void;
  placeBid: (roomCode: string, teamId: string, amount?: number) => void;
  exerciseRtm: (roomCode: string, teamId: string, decision: 'ACCEPT' | 'DECLINE') => void;
  togglePause: (roomCode: string) => void;
  startAccelerated: (roomCode: string, selectedUnsoldIds?: string[]) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  roomState: null,
  errorMessage: null,
  clearError: () => {},
  createRoom: () => {},
  joinRoom: () => {},
  claimTeam: () => {},
  unclaimTeam: () => {},
  startAuction: () => {},
  placeBid: () => {},
  exerciseRtm: () => {},
  togglePause: () => {},
  startAccelerated: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<AuctionRoomState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const socketInstance = io(socketUrl, {
      autoConnect: true,
      reconnectionAttempts: 10,
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Socket connected to server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('⚡ Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('room_state', (state: AuctionRoomState) => {
      setRoomState((prevState) => {
        // Trigger sounds on state changes
        if (prevState && prevState.currentPlayer?.id !== state.currentPlayer?.id) {
          if (state.phase === 'SOLD_PAUSE') soundManager.playSoldSound();
          if (state.phase === 'UNSOLD_PAUSE') soundManager.playUnsoldSound();
        }
        return state;
      });
    });

    socketInstance.on('bid_sound', () => {
      soundManager.playBidSound();
    });

    socketInstance.on('timer_tick', ({ secondsLeft }: { secondsLeft: number }) => {
      if (secondsLeft <= 5 && secondsLeft > 0) {
        soundManager.playTickSound();
      }
      setRoomState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          timer: {
            ...prev.timer,
            secondsLeft,
          },
        };
      });
    });

    socketInstance.on('error_msg', (msg: string) => {
      setErrorMessage(msg);
    });

    socketInstance.on('room_created', ({ roomCode }: { roomCode: string }) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('last_ipl_room', roomCode);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const clearError = () => setErrorMessage(null);

  const createRoom = (
    roomName: string,
    hostName: string,
    mode: 'MEGA_2025' | 'MINI_2026' = 'MEGA_2025',
    roomSize: number = 10,
    timerLength: number = 15,
    fillWithBots: boolean = false
  ) => {
    const sessionToken = getOrCreateSessionToken();
    socket?.emit('create_room', { roomName, hostName, sessionToken, mode, roomSize, timerLength, fillWithBots });
  };

  const joinRoom = (roomCode: string, userName?: string) => {
    const sessionToken = getOrCreateSessionToken();
    socket?.emit('join_room', { roomCode, sessionToken, userName });
  };

  const claimTeam = (roomCode: string, teamId: string, ownerName: string) => {
    const sessionToken = getOrCreateSessionToken();
    socket?.emit('claim_team', { roomCode, teamId, ownerName, sessionToken });
  };

  const unclaimTeam = (roomCode: string, teamId: string) => {
    socket?.emit('unclaim_team', { roomCode, teamId });
  };

  const startAuction = (roomCode: string) => {
    socket?.emit('start_auction', { roomCode });
  };

  const placeBid = (roomCode: string, teamId: string, amount?: number) => {
    socket?.emit('place_bid', { roomCode, teamId, amount });
  };

  const exerciseRtm = (roomCode: string, teamId: string, decision: 'ACCEPT' | 'DECLINE') => {
    socket?.emit('exercise_rtm', { roomCode, teamId, decision });
  };

  const togglePause = (roomCode: string) => {
    socket?.emit('toggle_pause', { roomCode });
  };

  const startAccelerated = (roomCode: string, selectedUnsoldIds?: string[]) => {
    socket?.emit('start_accelerated', { roomCode, selectedUnsoldIds });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        roomState,
        errorMessage,
        clearError,
        createRoom,
        joinRoom,
        claimTeam,
        unclaimTeam,
        startAuction,
        placeBid,
        exerciseRtm,
        togglePause,
        startAccelerated,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
