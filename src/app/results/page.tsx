'use client';

import React from 'react';
import { PostAuctionDashboard } from '../../components/PostAuctionDashboard';
import { useSocket } from '../../context/SocketContext';
import { LandingView } from '../../components/LandingView';

export default function ResultsPage() {
  const { roomState } = useSocket();
  return roomState ? <PostAuctionDashboard /> : <LandingView />;
}
