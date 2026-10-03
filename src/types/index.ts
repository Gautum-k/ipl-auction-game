export type PlayerRole = 'BATTER' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKETKEEPER';
export type PlayerCategory = 'CAPPED_INDIAN' | 'UNCAPPED_INDIAN' | 'OVERSEAS';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  category: PlayerCategory;
  country: string;
  isOverseas: boolean;
  basePrice: number; // in Rupees
  originalTeamId?: string; // For RTM option (e.g., 'CSK')
  setNumber: number;
  setName: string; // e.g. 'Marquee Set 1', 'Capped Batsmen 1'
  stats: {
    matches: number;
    runs?: number;
    wickets?: number;
    strikeRate?: number;
    economy?: number;
    highestScore?: string;
    bestBowling?: string;
    catches?: number;
  };
  imagePlaceholderUrl?: string;
}

export interface TeamState {
  teamId: string;
  teamName: string;
  shortName: string;
  ownerSocketId: string | null;
  ownerSessionToken: string | null;
  ownerName: string;
  isBot: boolean;
  purseRemaining: number;
  squad: Player[];
  rtmRemaining: number;
  isReady: boolean;
}

export type UserRole = 'HOST' | 'PLAYER' | 'SPECTATOR';

export type AuctionPhase =
  | 'LOBBY'
  | 'NOMINATING'
  | 'BIDDING'
  | 'RTM_PENDING'
  | 'SOLD_PAUSE'
  | 'UNSOLD_PAUSE'
  | 'PAUSED'
  | 'COMPLETED';

export interface BidLog {
  id: string;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  amount: number;
  timestamp: number;
  isRtm: boolean;
}

export interface AuctionRoomConfig {
  mode: 'MEGA_2025' | 'MINI_2026';
  roomSize: number; // 2 to 10 teams
  timerLength: number; // 10s, 15s, 20s, 30s
  fillWithBots: boolean; // Auto-bid AI bots for unclaimed teams
}

export interface SpectatorUser {
  socketId: string;
  sessionToken: string;
  name: string;
}

export interface AuctionRoomState {
  roomCode: string;
  roomName: string;
  hostSocketId: string;
  hostSessionToken: string;
  config: AuctionRoomConfig;
  spectators: SpectatorUser[];
  phase: AuctionPhase;
  currentSetIndex: number;
  currentPlayerIndex: number;
  currentPlayer: Player | null;
  currentBid: number;
  highestBidderTeamId: string | null;
  rtmClaimedByTeamId: string | null;
  rtmAskingBid: number | null;
  rtmRaisedPrice: number | null; // One-time raise price by highest bidder
  bidHistory: BidLog[];
  teams: Record<string, TeamState>;
  playerPool: Player[];
  soldPlayers: Array<{
    player: Player;
    soldToTeamId: string;
    amount: number;
    isRtm: boolean;
    bcciWelfareFund?: number; // Mini mode overseas pay cap surplus
  }>;
  unsoldPlayers: Player[];
  acceleratedPool: Player[];
  isAcceleratedMode: boolean;
  timer: {
    secondsLeft: number;
    isRunning: boolean;
    duration: number;
    bidDeadline: number; // Absolute timestamp for client clock offset calculation
  };
  createdAt: number;
  updatedAt: number;
}
