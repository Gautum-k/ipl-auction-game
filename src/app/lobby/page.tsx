'use client';

import React from 'react';
import { LobbyView } from '../../components/LobbyView';
import { useSocket } from '../../context/SocketContext';
import { LandingView } from '../../components/LandingView';

export default function LobbyPage() {
  const { roomState } = useSocket();
  return roomState ? <LobbyView /> : <LandingView />;
}
