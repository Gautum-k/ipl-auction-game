'use client';

import React, { useState } from 'react';
import { Trophy, Award, Users, Star, ArrowLeft, Share2, ShieldCheck, Download, DollarSign, PieChart } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { formatRupees, MEGA_MODE_RULES } from '../config/rules';
import { Player, TeamState } from '../types';

export const PostAuctionDashboard: React.FC = () => {
  const { roomState } = useSocket();
  const [activeTeamId, setActiveTeamId] = useState<string>('CSK');

  if (!roomState) return null;

  const activeTeam = roomState.teams[activeTeamId] || Object.values(roomState.teams)[0];
  const initialPurse = roomState.config?.mode === 'MEGA_2025' ? MEGA_MODE_RULES.maxPursePerTeam : 125_00_00_000;
  const totalSpent = initialPurse - activeTeam.purseRemaining;

  // Calculate ratings for squad: role balance score & value-for-money score
  const calculateTeamRatings = (team: TeamState) => {
    const squad = team.squad;
    const batters = squad.filter((p) => p.role === 'BATTER').length;
    const keepers = squad.filter((p) => p.role === 'WICKETKEEPER').length;
    const bowlers = squad.filter((p) => p.role === 'BOWLER').length;
    const allRounders = squad.filter((p) => p.role === 'ALL_ROUNDER').length;
    const overseas = squad.filter((p) => p.isOverseas).length;

    // 1. Role Balance Score (out of 100)
    let balanceScore = 50;
    if (batters >= 4) balanceScore += 12;
    if (bowlers >= 4) balanceScore += 12;
    if (keepers >= 1) balanceScore += 10;
    if (allRounders >= 2) balanceScore += 10;
    if (squad.length >= 18 && squad.length <= 25) balanceScore += 6;
    if (overseas <= 8) balanceScore += 0; else balanceScore -= 20;
    balanceScore = Math.min(100, Math.max(0, balanceScore));

    // 2. Value-for-Money Score (out of 100)
    let vfmScore = 75;
    if (squad.length > 0) {
      const avgPrice = (initialPurse - team.purseRemaining) / squad.length;
      const totalBasePrice = squad.reduce((sum, p) => sum + (p.basePrice || 2_00_00_000), 0);
      const spendRatio = totalSpent / Math.max(1, totalBasePrice);
      
      if (spendRatio < 2.5) vfmScore += 15;
      else if (spendRatio < 4.0) vfmScore += 5;
      else vfmScore -= 10;

      if (team.purseRemaining > 5_00_00_000) vfmScore += 10; // saved purse buffer
    }
    vfmScore = Math.min(100, Math.max(0, vfmScore));

    // 3. Overall Rating
    const overall = Math.round((balanceScore * 0.55) + (vfmScore * 0.45));

    return {
      balanceScore,
      vfmScore,
      overall,
      batters,
      keepers,
      bowlers,
      allRounders,
      overseas,
    };
  };

  const activeRatings = calculateTeamRatings(activeTeam);

  const copySquadSummary = () => {
    const summary = `🏆 IPL Auction — ${activeTeam.teamName} (${activeTeam.shortName})\n` +
      `Owner: ${activeTeam.ownerName || 'Unassigned'}\n` +
      `Total Spent: ${formatRupees(totalSpent)} | Remaining Purse: ${formatRupees(activeTeam.purseRemaining)}\n` +
      `Squad Size: ${activeTeam.squad.length} Players (Overseas: ${activeRatings.overseas}/8)\n` +
      `Ratings: Overall ${activeRatings.overall}/100 | Role Balance: ${activeRatings.balanceScore}/100 | VFM: ${activeRatings.vfmScore}/100\n\n` +
      `Purchased Roster:\n` +
      activeTeam.squad.map((p, i) => `${i + 1}. ${p.name} (${p.role}) - ${p.country} [${formatRupees(p.basePrice)}]`).join('\n');

    navigator.clipboard.writeText(summary);
    alert('Squad summary copied to clipboard!');
  };

  // Generate and download image card using HTML5 Canvas
  const downloadSummaryImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 700);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#1e1b4b');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 700);

    // Header Card Border / Accent
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 1140, 640);

    // Title & Team Name
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`IPL Auction — Final Squad Card`, 60, 90);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'black 48px sans-serif';
    ctx.fillText(`${activeTeam.teamName} (${activeTeam.shortName})`, 60, 150);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Owner: ${activeTeam.ownerName || 'Unassigned'}`, 60, 185);

    // Stats Grid Box
    ctx.fillStyle = '#090d16';
    ctx.fillRect(60, 220, 500, 420);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(60, 220, 500, 420);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('FINANCIAL & RATING SUMMARY', 80, 260);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Total Purse Spent:`, 80, 310);
    ctx.fillStyle = '#ef4444';
    ctx.fillText(formatRupees(totalSpent), 340, 310);

    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`Remaining Purse:`, 80, 350);
    ctx.fillStyle = '#10b981';
    ctx.fillText(formatRupees(activeTeam.purseRemaining), 340, 350);

    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`Squad Size:`, 80, 390);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${activeTeam.squad.length} / 25 players`, 340, 390);

    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`Overseas Limit:`, 80, 430);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${activeRatings.overseas} / 8 overseas`, 340, 430);

    // Ratings
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`Overall Squad Rating: ${activeRatings.overall}/100`, 80, 490);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '16px sans-serif';
    ctx.fillText(`• Role Balance Score: ${activeRatings.balanceScore}/100`, 80, 530);
    ctx.fillText(`• Value-For-Money Score: ${activeRatings.vfmScore}/100`, 80, 565);

    // Right Box: Top Players Roster
    ctx.fillStyle = '#090d16';
    ctx.fillRect(590, 220, 550, 420);
    ctx.strokeRect(590, 220, 550, 420);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`SQUAD ROSTER (${activeTeam.squad.length})`, 610, 260);

    const roster = activeTeam.squad.slice(0, 10);
    roster.forEach((p, idx) => {
      const y = 300 + idx * 32;
      ctx.fillStyle = '#ffffff';
      ctx.font = '15px sans-serif';
      ctx.fillText(`${idx + 1}. ${p.name.slice(0, 24)} (${p.role})`, 610, y);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(formatRupees(p.basePrice), 980, y);
    });

    if (activeTeam.squad.length > 10) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'italic 14px sans-serif';
      ctx.fillText(`+ ${activeTeam.squad.length - 10} more players in squad`, 610, 620);
    }

    // Trigger Download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${activeTeam.shortName}_squad_summary.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 text-white">
      {/* Dashboard Header */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-slate-800 p-8 shadow-2xl text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
          <Trophy className="w-4 h-4" /> Auction Concluded — Final Results
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
          Final Squads & Franchise Ratings
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Explore complete squad rosters, purse spent vs remaining, role balance, and value-for-money scores!
        </p>
      </div>

      {/* Team Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {Object.values(roomState.teams).map((team) => (
          <button
            key={team.teamId}
            onClick={() => setActiveTeamId(team.teamId)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition border ${
              activeTeamId === team.teamId
                ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            {team.shortName} ({team.squad.length})
          </button>
        ))}
      </div>

      {/* Active Team Overview & Ratings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Financial & Rating Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold">{activeTeam.teamName}</h3>
                <span className="text-xs text-slate-400">Owner: {activeTeam.ownerName || 'Unassigned'}</span>
              </div>
              <span className="font-extrabold text-lg text-amber-400">{activeTeam.shortName}</span>
            </div>

            {/* Financial Overview Tiles */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">Total Spent</span>
                <p className="text-lg font-black text-rose-400">{formatRupees(totalSpent)}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">Remaining Purse</span>
                <p className="text-lg font-black text-emerald-400">{formatRupees(activeTeam.purseRemaining)}</p>
              </div>
            </div>

            {/* Score Ring */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-32 h-32 rounded-full bg-slate-950 border-4 border-amber-500/40 flex flex-col items-center justify-center shadow-inner">
                <span className="text-3xl font-black text-white">{activeRatings.overall}</span>
                <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Overall Score</span>
              </div>
            </div>

            {/* Detailed Ratings Breakdown */}
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <PieChart className="w-3.5 h-3.5 text-sky-400" /> Role Balance Score
                  </span>
                  <span className="font-bold text-sky-400">{activeRatings.balanceScore}/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div className="h-full bg-sky-400 transition-all" style={{ width: `${activeRatings.balanceScore}%` }} />
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Batters: {activeRatings.batters} | Bowlers: {activeRatings.bowlers} | Keepers: {activeRatings.keepers} | AR: {activeRatings.allRounders}
                </span>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Value-for-Money Score
                  </span>
                  <span className="font-bold text-emerald-400">{activeRatings.vfmScore}/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div className="h-full bg-emerald-400 transition-all" style={{ width: `${activeRatings.vfmScore}%` }} />
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Cost efficiency & purse management relative to base prices
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={copySquadSummary}
                className="py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition"
              >
                <Share2 className="w-4 h-4" /> Share Text
              </button>

              <button
                onClick={downloadSummaryImage}
                className="py-3 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center gap-1.5 transition shadow-md shadow-amber-500/20"
              >
                <Download className="w-4 h-4" /> Save as Image
              </button>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Purchased Player Roster */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
            <h4 className="font-bold text-lg text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" /> Purchased Roster ({activeTeam.squad.length} Players)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
              {activeTeam.squad.map((player) => (
                <div
                  key={player.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-white text-sm block">{player.name}</span>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">{player.role}</span>
                      {player.isOverseas && <span className="text-sky-400 font-bold">✈️ Overseas</span>}
                    </div>
                  </div>

                  <span className="font-mono font-bold text-amber-400">
                    {formatRupees(player.basePrice)}
                  </span>
                </div>
              ))}

              {activeTeam.squad.length === 0 && (
                <div className="col-span-2 py-12 text-center text-slate-500 text-sm">
                  No players were purchased by this franchise.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

