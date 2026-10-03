'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { INITIAL_PLAYER_DATASET } from '../data/players';
import { Player } from '../types';

export const AccelNominationView: React.FC = () => {
  const { roomState, socket, nominatePlayer, unnominatePlayer, markNominationDone, startAcceleratedBidding } =
    useSocket();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [nationalityFilter, setNationalityFilter] = useState<string>('ALL');
  const [secondsLeft, setSecondsLeft] = useState<number>(90);

  // Local user's claimed team
  const myTeam = useMemo(() => {
    if (!roomState || !socket) return null;
    return Object.values(roomState.teams).find((t) => t.ownerSocketId === socket.id) || null;
  }, [roomState, socket]);

  const isHost = roomState?.hostSocketId === socket?.id;
  const isTeamDone = myTeam ? (roomState?.nominationDoneTeams || []).includes(myTeam.teamId) : false;

  // Server countdown timer sync
  useEffect(() => {
    const updateCountdown = () => {
      if (roomState?.accelNominationDeadline) {
        const remaining = Math.max(0, Math.ceil((roomState.accelNominationDeadline - Date.now()) / 1000));
        setSecondsLeft(remaining);
      } else {
        setSecondsLeft(roomState?.timer.secondsLeft || 90);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [roomState?.accelNominationDeadline, roomState?.timer.secondsLeft]);

  // Master player lookup map
  const knownPlayersMap = useMemo(() => {
    const map = new Map<string, Player>();
    INITIAL_PLAYER_DATASET.forEach((p) => map.set(p.id, p));
    if (roomState) {
      roomState.playerPool.forEach((p) => map.set(p.id, p));
      roomState.unsoldPlayers.forEach((p) => map.set(p.id, p));
    }
    return map;
  }, [roomState]);

  // Unsold pool players list
  const unsoldPoolPlayers = useMemo(() => {
    if (!roomState?.unsoldPool) return [];
    return roomState.unsoldPool
      .map((id) => knownPlayersMap.get(id))
      .filter((p): p is Player => p !== undefined);
  }, [roomState, knownPlayersMap]);

  // Filtered unsold players
  const filteredPlayers = useMemo(() => {
    return unsoldPoolPlayers.filter((player) => {
      const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || player.role === roleFilter;
      const matchesNat =
        nationalityFilter === 'ALL' ||
        (nationalityFilter === 'INDIAN' && !player.isOverseas) ||
        (nationalityFilter === 'OVERSEAS' && player.isOverseas);
      return matchesSearch && matchesRole && matchesNat;
    });
  }, [unsoldPoolPlayers, searchQuery, roleFilter, nationalityFilter]);

  // User team's current nominations
  const myNominatedIds = useMemo(() => {
    if (!myTeam || !roomState?.nominations) return [];
    return roomState.nominations[myTeam.teamId] || [];
  }, [myTeam, roomState]);

  const myNominatedPlayers = useMemo(() => {
    return myNominatedIds
      .map((id) => knownPlayersMap.get(id))
      .filter((p): p is Player => p !== undefined);
  }, [myNominatedIds, knownPlayersMap]);

  // Total nomination counts across all teams for badges
  const totalNominationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (roomState?.nominations) {
      Object.values(roomState.nominations).forEach((list) => {
        if (Array.isArray(list)) {
          list.forEach((id) => {
            counts[id] = (counts[id] || 0) + 1;
          });
        }
      });
    }
    return counts;
  }, [roomState]);

  // Check if player is affordable for user team
  const checkAffordability = (player: Player) => {
    if (!myTeam) return { affordable: true, reason: '' };

    if (myTeam.purseRemaining < player.basePrice) {
      return { affordable: false, reason: 'Purse Exceeded' };
    }

    if (myTeam.squad.length + myNominatedIds.length >= 25) {
      return { affordable: false, reason: 'Squad Maxed (25)' };
    }

    if (player.isOverseas) {
      const currentOverseasSquad = myTeam.squad.filter((p) => p.isOverseas).length;
      const currentOverseasNominated = myNominatedPlayers.filter((p) => p.isOverseas).length;
      if (currentOverseasSquad + currentOverseasNominated >= 8) {
        return { affordable: false, reason: 'Overseas Maxed (8)' };
      }
    }

    return { affordable: true, reason: 'Affordable' };
  };

  if (!roomState) return null;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-amber-500/40 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full text-xs font-bold tracking-wider uppercase">
              Phase 13 Accelerated
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Accelerated Round Nomination
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Nominate unsold players from the pool. De-duplicated union of all team picks will be offered in accelerated bidding.
          </p>
        </div>

        {/* Deadline & Host Controls */}
        <div className="flex items-center gap-4">
          <div className="text-center px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Deadline</div>
            <div className={`text-2xl font-mono font-bold ${secondsLeft <= 15 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
              {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>

          {isHost && (
            <button
              onClick={() => startAcceleratedBidding(roomState.roomCode)}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all text-sm"
            >
              Start Bidding Now
            </button>
          )}
        </div>
      </div>

      {/* Main Grid & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Filter & Unsold Grid */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search unsold player by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
            />

            {/* Role Filter Tabs */}
            <div className="flex flex-wrap gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg text-xs">
              {['ALL', 'WICKETKEEPER', 'BATTER', 'ALL_ROUNDER', 'BOWLER'].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                    roleFilter === role ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {role === 'ALL_ROUNDER' ? 'ALL-ROUNDER' : role}
                </button>
              ))}
            </div>

            {/* Nationality Filter */}
            <div className="flex gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg text-xs">
              {['ALL', 'INDIAN', 'OVERSEAS'].map((nat) => (
                <button
                  key={nat}
                  onClick={() => setNationalityFilter(nat)}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                    nationalityFilter === nat ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {nat}
                </button>
              ))}
            </div>
          </div>

          {/* Players Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[650px] overflow-y-auto pr-1">
            {filteredPlayers.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                No unsold players matching current filters.
              </div>
            ) : (
              filteredPlayers.map((player) => {
                const isNominatedByMe = myNominatedIds.includes(player.id);
                const { affordable, reason } = checkAffordability(player);
                const nomCount = totalNominationCounts[player.id] || 0;

                return (
                  <div
                    key={player.id}
                    className={`bg-slate-900/90 border rounded-xl p-4 flex flex-col justify-between transition-all ${
                      isNominatedByMe
                        ? 'border-amber-500/80 shadow-lg shadow-amber-500/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {player.role}
                        </span>
                        <div className="flex gap-1">
                          {player.isOverseas ? (
                            <span className="text-xs px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                              Overseas
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-700/40">
                              Indian
                            </span>
                          )}
                          {nomCount > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50 font-semibold">
                              {nomCount} {nomCount === 1 ? 'nomination' : 'nominations'}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white mt-2 leading-tight">{player.name}</h3>
                      <div className="text-xs text-slate-400 mt-0.5">Base: ₹{player.basePrice / 100000} Lakhs</div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      {affordable ? (
                        <span className="text-xs text-emerald-400 font-medium">Affordable</span>
                      ) : (
                        <span className="text-xs text-red-400 font-medium">{reason}</span>
                      )}

                      {myTeam && (
                        <button
                          disabled={isTeamDone || (!isNominatedByMe && !affordable)}
                          onClick={() => {
                            if (isNominatedByMe) {
                              unnominatePlayer(roomState.roomCode, player.id);
                            } else {
                              nominatePlayer(roomState.roomCode, player.id);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isNominatedByMe
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40'
                              : affordable && !isTeamDone
                              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md'
                              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          {isNominatedByMe ? 'Remove' : 'Nominate'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Team Nominations & Team Status Drawer */}
        <div className="space-y-4">
          {/* User's Team Card */}
          {myTeam ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{myTeam.teamName}</h2>
                  <div className="text-xs text-amber-400 font-semibold mt-0.5">
                    Purse: ₹{(myTeam.purseRemaining / 10000000).toFixed(2)} Cr
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono rounded-md">
                  {myTeam.shortName}
                </span>
              </div>

              {/* Roster / Overseas stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-400">Squad</div>
                  <div className="text-sm font-bold text-white">{myTeam.squad.length} / 25</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-400">Overseas</div>
                  <div className="text-sm font-bold text-white">
                    {myTeam.squad.filter((p) => p.isOverseas).length} / 8
                  </div>
                </div>
              </div>

              {/* My Nominated Picks List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    My Nominated Picks ({myNominatedPlayers.length})
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {myNominatedPlayers.length === 0 ? (
                    <div className="text-xs text-slate-500 italic py-3 text-center bg-slate-950/50 rounded-lg border border-slate-800/50">
                      No nominations picked yet. Select from grid.
                    </div>
                  ) : (
                    myNominatedPlayers.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800 text-xs"
                      >
                        <div className="truncate mr-2">
                          <div className="font-semibold text-white truncate">{player.name}</div>
                          <div className="text-[10px] text-slate-400">₹{player.basePrice / 100000}L • {player.role}</div>
                        </div>

                        {!isTeamDone && (
                          <button
                            onClick={() => unnominatePlayer(roomState.roomCode, player.id)}
                            className="text-red-400 hover:text-red-300 font-bold px-1.5 py-0.5"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Done Button */}
              <button
                onClick={() => markNominationDone(roomState.roomCode)}
                disabled={isTeamDone}
                className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
                  isTeamDone
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80 cursor-default'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950'
                }`}
              >
                {isTeamDone ? '✓ Nominations Submitted (Done)' : 'Mark Done'}
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 text-center text-slate-400 text-sm">
              Spectator Mode — Viewing Accelerated Nominations
            </div>
          )}

          {/* All Teams Status Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Teams Status ({roomState.nominationDoneTeams?.length || 0} / {Object.keys(roomState.teams).length} Done)
            </h3>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {Object.values(roomState.teams).map((team) => {
                const isDone = (roomState.nominationDoneTeams || []).includes(team.teamId);
                const count = (roomState.nominations?.[team.teamId] || []).length;

                return (
                  <div
                    key={team.teamId}
                    className="flex items-center justify-between p-2 bg-slate-950 rounded-lg text-xs border border-slate-800/60"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{team.shortName}</span>
                      {team.isBot && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">BOT</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{count} picks</span>
                      {isDone ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                          Done
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-950 text-amber-400 border border-amber-800/60 animate-pulse">
                          Picking...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
