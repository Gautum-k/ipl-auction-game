'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getOrCreateSessionToken } from '../lib/session';
import { soundManager } from '../lib/sound';
import { AuctionRoomState } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isRehydrating: boolean;
  roomState: AuctionRoomState | null;
  errorMessage: string | null;
  clearError: () => void;
  leaveRoom: () => void;
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
  nominatePlayer: (roomCode: string, playerId: string) => void;
  unnominatePlayer: (roomCode: string, playerId: string) => void;
  markNominationDone: (roomCode: string) => void;
  startAcceleratedBidding: (roomCode: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  isRehydrating: false,
  roomState: null,
  errorMessage: null,
  clearError: () => {},
  leaveRoom: () => {},
  createRoom: () => {},
  joinRoom: () => {},
  claimTeam: () => {},
  unclaimTeam: () => {},
  startAuction: () => {},
  placeBid: () => {},
  exerciseRtm: () => {},
  togglePause: () => {},
  startAccelerated: () => {},
  nominatePlayer: () => {},
  unnominatePlayer: () => {},
  markNominationDone: () => {},
  startAcceleratedBidding: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<AuctionRoomState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRehydrating, setIsRehydrating] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      const savedRoom = localStorage.getItem('last_ipl_room');
      return Boolean(urlRoom || savedRoom);
    }
    return false;
  });

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const socketInstance = io(socketUrl, {
      autoConnect: true,
      reconnectionAttempts: 10,
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Socket connected to server');
      setIsConnected(true);

      // Auto-rejoin stored or URL room on connection / page refresh
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const targetRoom = params.get('room') || localStorage.getItem('last_ipl_room');
        if (targetRoom) {
          const sessionToken = getOrCreateSessionToken(targetRoom);
          console.log(`🔄 Rehydrating room session for room: ${targetRoom}`);
          socketInstance.emit('join_room', { roomCode: targetRoom, sessionToken });
        } else {
          setIsRehydrating(false);
        }
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('⚡ Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('room_state', (state: AuctionRoomState) => {
      setIsRehydrating(false);
      setRoomState((prevState) => {
        // Trigger sounds on state changes
        if (prevState && prevState.currentPlayer?.id !== state.currentPlayer?.id) {
          if (state.phase === 'SOLD_PAUSE') soundManager.playSoldSound();
          if (state.phase === 'UNSOLD_PAUSE') soundManager.playUnsoldSound();
        }
        return state;
      });

      // Synchronize URL and local storage with active room code
      if (state.roomCode && typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (url.searchParams.get('room') !== state.roomCode) {
          url.searchParams.set('room', state.roomCode);
          window.history.replaceState(null, '', url.pathname + url.search);
        }
        localStorage.setItem('last_ipl_room', state.roomCode);
      }
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

    socketInstance.on('session_replaced', (msg: string) => {
      setIsRehydrating(false);
      setErrorMessage(msg);
      setRoomState(null);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (url.searchParams.has('room')) {
          url.searchParams.delete('room');
          window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
        }
        localStorage.removeItem('last_ipl_room');
      }
    });

    socketInstance.on('error_msg', (msg: string) => {
      setIsRehydrating(false);
      setErrorMessage(msg);
      // If error occurs during rehydration, clean up URL and local storage
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (url.searchParams.has('room')) {
          url.searchParams.delete('room');
          window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
        }
        localStorage.removeItem('last_ipl_room');
      }
    });

    socketInstance.on('room_created', ({ roomCode }: { roomCode: string }) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('last_ipl_room', roomCode);
        const url = new URL(window.location.href);
        url.searchParams.set('room', roomCode);
        window.history.replaceState(null, '', url.pathname + url.search);
      }
    });

    // eslint-disable-next-line
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Enforce 5-second maximum rehydration timeout guard
  useEffect(() => {
    if (isRehydrating) {
      const timer = setTimeout(() => {
        setIsRehydrating((curr) => {
          if (curr) {
            setErrorMessage('Reconnecting to room timed out. Please verify your room code or connection.');
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href);
              if (url.searchParams.has('room')) {
                url.searchParams.delete('room');
                window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
              }
              localStorage.removeItem('last_ipl_room');
            }
            return false;
          }
          return false;
        });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isRehydrating]);

  const clearError = () => setErrorMessage(null);

  const leaveRoom = () => {
    setRoomState(null);
    setIsRehydrating(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('room')) {
        url.searchParams.delete('room');
        window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
      }
      localStorage.removeItem('last_ipl_room');
    }
  };

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
    const sessionToken = getOrCreateSessionToken(roomCode);
    socket?.emit('join_room', { roomCode, sessionToken, userName });
  };

  const claimTeam = (roomCode: string, teamId: string, ownerName: string) => {
    const sessionToken = getOrCreateSessionToken(roomCode);
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

  const nominatePlayer = (roomCode: string, playerId: string) => {
    socket?.emit('accel:nominate', { roomCode, playerId });
  };

  const unnominatePlayer = (roomCode: string, playerId: string) => {
    socket?.emit('accel:unnominate', { roomCode, playerId });
  };

  const markNominationDone = (roomCode: string) => {
    socket?.emit('accel:done', { roomCode });
  };

  const startAcceleratedBidding = (roomCode: string) => {
    socket?.emit('accel:start_bidding', { roomCode });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        isRehydrating,
        roomState,
        errorMessage,
        clearError,
        leaveRoom,
        createRoom,
        joinRoom,
        claimTeam,
        unclaimTeam,
        startAuction,
        placeBid,
        exerciseRtm,
        togglePause,
        startAccelerated,
        nominatePlayer,
        unnominatePlayer,
        markNominationDone,
        startAcceleratedBidding,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
