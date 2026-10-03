'use client';

import React from 'react';
import { AuctionArena } from '../../components/AuctionArena';
import { useSocket } from '../../context/SocketContext';
import { LandingView } from '../../components/LandingView';

export default function AuctionPage() {
  const { roomState } = useSocket();
  return roomState ? <AuctionArena /> : <LandingView />;
}
