'use client';

import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, HelpCircle, Trophy, Gavel } from 'lucide-react';
import { formatRupees, getNextMinBid } from '../config/rules';
import { Avatar } from './ui/Avatar';
import { CountdownRing } from './ui/CountdownRing';

export const PracticeRound: React.FC = () => {
  const [inProgress, setInProgress] = useState(false);
  const [currentBid, setCurrentBid] = useState(2_00_00_000); // 2 Cr
  const [highBidder, setHighBidder] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [isUserHighBidder, setIsUserHighBidder] = useState(false);
  const [stepTooltip, setStepTooltip] = useState('Click "Start Practice Bid" to test bidding against AI bots!');

  const player = {
    name: 'Virat Kohli (Practice)',
    role: 'BATTER',
    country: 'India',
    basePrice: 2_00_00_000,
  };

  const nextBidAmount = getNextMinBid(currentBid, player.basePrice);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (inProgress && secondsLeft > 0) {
      timer = setTimeout(() => {
        setSecondsLeft((s) => s - 1);

        // AI Bot counter-bid simulation at 8 seconds if user is leading
        if (secondsLeft === 8 && isUserHighBidder) {
          const botBid = getNextMinBid(currentBid, player.basePrice);
          setCurrentBid(botBid);
          setHighBidder('Mumbai Indians (AI Bot)');
          setIsUserHighBidder(false);
          setStepTooltip('MI Bot placed a counter-bid! Click "BID NOW" to outbid them.');
        }
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [inProgress, secondsLeft, isUserHighBidder, currentBid, player.basePrice]);

  const handleStart = () => {
    setInProgress(true);
    setCurrentBid(2_00_00_000);
    setHighBidder('Royal Challengers (AI Bot)');
    setSecondsLeft(15);
    setIsUserHighBidder(false);
    setStepTooltip('RCB Bot opened the bid at ₹2 Crore. Press "BID NOW" to place your bid!');
  };

  const handleUserBid = () => {
    if (!inProgress) return;
    setCurrentBid(nextBidAmount);
    setHighBidder('Your Team (CSK)');
    setIsUserHighBidder(true);
    setSecondsLeft(10);
    setStepTooltip('Great bid! You are now the highest bidder. Watch the timer or wait for bots.');
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-amber-500/30 p-6 sm:p-8 space-y-6 text-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Interactive Sandbox Practice Auction</h3>
            <p className="text-xs text-slate-400">Practice real-time bidding against AI bots with guided tooltips</p>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl flex items-center gap-1.5 transition shadow-md"
        >
          {inProgress ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {inProgress ? 'Restart Practice' : 'Start Practice Bid'}
        </button>
      </div>

      {/* Guided Tooltip Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
        <HelpCircle className="w-5 h-5 shrink-0 text-amber-400" />
        <span className="font-semibold">{stepTooltip}</span>
      </div>

      {/* Practice Arena Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Player Spotlight */}
        <div className="md:col-span-6 flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <Avatar name={player.name} size="lg" />
          <div>
            <h4 className="font-bold text-lg text-white">{player.name}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-800 font-semibold text-slate-300">{player.role}</span>
              <span>•</span>
              <span>Base: {formatRupees(player.basePrice)}</span>
            </div>
          </div>
        </div>

        {/* Current Bid & Timer Ring */}
        <div className="md:col-span-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">Current High Bid</span>
            <p className="text-3xl font-black text-amber-400">{formatRupees(currentBid)}</p>
            {highBidder && <span className="text-xs text-emerald-400 font-semibold">Led by: {highBidder}</span>}
          </div>

          <CountdownRing secondsLeft={secondsLeft} duration={15} size={56} />
        </div>
      </div>

      {/* Action Button */}
      <button
        disabled={!inProgress || isUserHighBidder}
        onClick={handleUserBid}
        className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-2 ${
          !inProgress || isUserHighBidder
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            : 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 text-slate-950 shadow-amber-500/20 cursor-pointer'
        }`}
      >
        <Gavel className="w-5 h-5 stroke-[2.5]" />
        {isUserHighBidder ? 'You Are Leading the Bid!' : `BID NOW: ${formatRupees(nextBidAmount)}`}
      </button>
    </div>
  );
};
