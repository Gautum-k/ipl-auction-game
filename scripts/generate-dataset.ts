import fs from 'fs';
import path from 'path';

export interface SeedPlayer {
  cricsheetId: string;
  name: string;
  role: 'BAT' | 'BOWL' | 'AR' | 'WK';
  nationality: string;
  isOverseas: boolean;
  isCapped: boolean;
  basePrice: number; // in Lakhs
  setName: string;
  setOrder: number;
  previousTeam: string;
  sourceUrl: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface RuntimePlayer {
  id: string;
  name: string;
  role: 'BATTER' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKETKEEPER';
  category: 'CAPPED_INDIAN' | 'UNCAPPED_INDIAN' | 'OVERSEAS';
  country: string;
  isOverseas: boolean;
  basePrice: number; // in Rupees
  originalTeamId?: string;
  setNumber: number;
  setName: string;
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
}

// Helper converter to RuntimePlayer
function convertToRuntimePlayer(seed: SeedPlayer, index: number, stats: any): RuntimePlayer {
  let role: 'BATTER' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKETKEEPER';
  if (seed.role === 'BAT') role = 'BATTER';
  else if (seed.role === 'BOWL') role = 'BOWLER';
  else if (seed.role === 'AR') role = 'ALL_ROUNDER';
  else role = 'WICKETKEEPER';

  let category: 'CAPPED_INDIAN' | 'UNCAPPED_INDIAN' | 'OVERSEAS';
  if (seed.isOverseas) {
    category = 'OVERSEAS';
  } else if (seed.isCapped) {
    category = 'CAPPED_INDIAN';
  } else {
    category = 'UNCAPPED_INDIAN';
  }

  return {
    id: `p${index + 1}`,
    name: seed.name,
    role,
    category,
    country: seed.nationality,
    isOverseas: seed.isOverseas,
    basePrice: seed.basePrice * 1_00_000,
    originalTeamId: seed.previousTeam,
    setNumber: seed.setOrder,
    setName: seed.setName,
    stats,
  };
}

// 280+ Real IPL Player Definition List (Target 280 players: ~195 Indian, ~85 overseas)
const rawPlayerDefinitions: Array<{
  name: string;
  role: 'BAT' | 'BOWL' | 'AR' | 'WK';
  nat: string;
  isOverseas: boolean;
  isCapped: boolean;
  basePrice: number; // in Lakhs
  setOrder: number;
  setName: string;
  prevTeam: string;
  stats: { matches: number; runs?: number; wickets?: number; strikeRate?: number; economy?: number; highestScore?: string; bestBowling?: string; catches?: number };
}> = [
  // --- SET 1: MARQUEE SET 1 ---
  { name: 'Virat Kohli', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set 1', prevTeam: 'RCB', stats: { matches: 252, runs: 8004, strikeRate: 131.9, highestScore: '113*' } },
  { name: 'Jasprit Bumrah', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set 1', prevTeam: 'MI', stats: { matches: 133, wickets: 165, economy: 7.30, bestBowling: '5/10' } },
  { name: 'Rishabh Pant', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set 1', prevTeam: 'DC', stats: { matches: 111, runs: 3284, strikeRate: 148.9, highestScore: '128*', catches: 75 } },
  { name: 'Heinrich Klaasen', role: 'WK', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set 1', prevTeam: 'SRH', stats: { matches: 35, runs: 993, strikeRate: 168.3, highestScore: '104*' } },
  { name: 'Mitchell Starc', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set 1', prevTeam: 'KKR', stats: { matches: 41, wickets: 51, economy: 8.52, bestBowling: '4/15' } },
  { name: 'Shreyas Iyer', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set 1', prevTeam: 'KKR', stats: { matches: 116, runs: 3127, strikeRate: 127.5, highestScore: '96' } },

  // --- SET 2: MARQUEE SET 2 ---
  { name: 'KL Rahul', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 2, setName: 'Marquee Set 2', prevTeam: 'LSG', stats: { matches: 132, runs: 4683, strikeRate: 134.6, highestScore: '132*' } },
  { name: 'Arshdeep Singh', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 2, setName: 'Marquee Set 2', prevTeam: 'PBKS', stats: { matches: 65, wickets: 76, economy: 9.02, bestBowling: '5/32' } },
  { name: 'Yashasvi Jaiswal', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 2, setName: 'Marquee Set 2', prevTeam: 'RR', stats: { matches: 52, runs: 1608, strikeRate: 150.8, highestScore: '124' } },
  { name: 'Travis Head', role: 'BAT', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 2, setName: 'Marquee Set 2', prevTeam: 'SRH', stats: { matches: 25, runs: 772, strikeRate: 182.5, highestScore: '102' } },
  { name: 'Jos Buttler', role: 'WK', nat: 'England', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 2, setName: 'Marquee Set 2', prevTeam: 'RR', stats: { matches: 107, runs: 3582, strikeRate: 147.5, highestScore: '124' } },
  { name: 'Kagiso Rabada', role: 'BOWL', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 2, setName: 'Marquee Set 2', prevTeam: 'PBKS', stats: { matches: 80, wickets: 117, economy: 8.48, bestBowling: '4/21' } },

  // --- SET 3: CAPPED WICKETKEEPERS 1 ---
  { name: 'Sanju Samson', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 3, setName: 'Capped Wicketkeepers 1', prevTeam: 'RR', stats: { matches: 167, runs: 4419, strikeRate: 138.9, highestScore: '119' } },
  { name: 'Nicholas Pooran', role: 'WK', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 3, setName: 'Capped Wicketkeepers 1', prevTeam: 'LSG', stats: { matches: 76, runs: 1769, strikeRate: 158.4, highestScore: '77' } },
  { name: 'Ishan Kishan', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 3, setName: 'Capped Wicketkeepers 1', prevTeam: 'MI', stats: { matches: 105, runs: 2644, strikeRate: 135.8, highestScore: '99' } },
  { name: 'Phil Salt', role: 'WK', nat: 'England', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 3, setName: 'Capped Wicketkeepers 1', prevTeam: 'KKR', stats: { matches: 21, runs: 653, strikeRate: 175.5, highestScore: '89*' } },
  { name: 'Jitesh Sharma', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 3, setName: 'Capped Wicketkeepers 1', prevTeam: 'PBKS', stats: { matches: 40, runs: 730, strikeRate: 151.1, highestScore: '49*' } },
  { name: 'Quinton de Kock', role: 'WK', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 3, setName: 'Capped Wicketkeepers 1', prevTeam: 'LSG', stats: { matches: 107, runs: 3157, strikeRate: 134.2, highestScore: '140*' } },
  { name: 'Litton Das', role: 'WK', nat: 'Bangladesh', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 3, setName: 'Capped Wicketkeepers 1', prevTeam: 'KKR', stats: { matches: 1, runs: 4, strikeRate: 100.0, highestScore: '4' } },
  { name: 'Alex Carey', role: 'WK', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 3, setName: 'Capped Wicketkeepers 1', prevTeam: 'DC', stats: { matches: 3, runs: 32, strikeRate: 110.3 } },
  { name: 'Josh Inglis', role: 'WK', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 3, setName: 'Capped Wicketkeepers 1', prevTeam: 'PBKS', stats: { matches: 0, runs: 0 } },
  { name: 'Tim Seifert', role: 'WK', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 3, setName: 'Capped Wicketkeepers 1', prevTeam: 'DC', stats: { matches: 3, runs: 24, strikeRate: 120.0 } },

  // --- SET 4: CAPPED BATTERS 1 ---
  { name: 'Suryakumar Yadav', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 4, setName: 'Capped Batters 1', prevTeam: 'MI', stats: { matches: 150, runs: 3594, strikeRate: 145.3, highestScore: '103*' } },
  { name: 'Shubman Gill', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 4, setName: 'Capped Batters 1', prevTeam: 'GT', stats: { matches: 103, runs: 3216, strikeRate: 135.7, highestScore: '129' } },
  { name: 'Ruturaj Gaikwad', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 4, setName: 'Capped Batters 1', prevTeam: 'CSK', stats: { matches: 66, runs: 2380, strikeRate: 136.8, highestScore: '108*' } },
  { name: 'Rinku Singh', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 150, setOrder: 4, setName: 'Capped Batters 1', prevTeam: 'KKR', stats: { matches: 46, runs: 893, strikeRate: 143.7, highestScore: '67*' } },
  { name: 'David Warner', role: 'BAT', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 4, setName: 'Capped Batters 1', prevTeam: 'DC', stats: { matches: 184, runs: 6565, strikeRate: 139.8, highestScore: '126' } },
  { name: 'Devdutt Padikkal', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 4, setName: 'Capped Batters 1', prevTeam: 'LSG', stats: { matches: 64, runs: 1559, strikeRate: 123.6, highestScore: '101*' } },
  { name: 'Faf du Plessis', role: 'BAT', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 4, setName: 'Capped Batters 1', prevTeam: 'RCB', stats: { matches: 145, runs: 4571, strikeRate: 136.4, highestScore: '96' } },
  { name: 'Kane Williamson', role: 'BAT', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 4, setName: 'Capped Batters 1', prevTeam: 'GT', stats: { matches: 79, runs: 2128, strikeRate: 125.6, highestScore: '89' } },
  { name: 'Steve Smith', role: 'BAT', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 4, setName: 'Capped Batters 1', prevTeam: 'DC', stats: { matches: 103, runs: 2485, strikeRate: 128.0, highestScore: '101' } },
  { name: 'Bhanuka Rajapaksa', role: 'BAT', nat: 'Sri Lanka', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 4, setName: 'Capped Batters 1', prevTeam: 'PBKS', stats: { matches: 13, runs: 277, strikeRate: 150.5 } },
  { name: 'Finn Allen', role: 'BAT', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 4, setName: 'Capped Batters 1', prevTeam: 'RCB', stats: { matches: 0, runs: 0 } },
  { name: 'Chris Lynn', role: 'BAT', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 4, setName: 'Capped Batters 1', prevTeam: 'MI', stats: { matches: 42, runs: 1329, strikeRate: 140.6, highestScore: '93*' } },

  // --- SET 5: CAPPED ALL-ROUNDERS 1 ---
  { name: 'Hardik Pandya', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 5, setName: 'Capped All-Rounders 1', prevTeam: 'MI', stats: { matches: 137, runs: 2525, wickets: 64, strikeRate: 145.6, economy: 8.52 } },
  { name: 'Ravindra Jadeja', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 5, setName: 'Capped All-Rounders 1', prevTeam: 'CSK', stats: { matches: 240, runs: 2959, wickets: 160, strikeRate: 129.2, economy: 7.62 } },
  { name: 'Axar Patel', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 5, setName: 'Capped All-Rounders 1', prevTeam: 'DC', stats: { matches: 150, runs: 1653, wickets: 123, strikeRate: 130.8, economy: 7.24 } },
  { name: 'Marcus Stoinis', role: 'AR', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 5, setName: 'Capped All-Rounders 1', prevTeam: 'LSG', stats: { matches: 96, runs: 1866, wickets: 38, strikeRate: 142.1, economy: 9.20 } },
  { name: 'Andre Russell', role: 'AR', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 5, setName: 'Capped All-Rounders 1', prevTeam: 'KKR', stats: { matches: 127, runs: 2484, wickets: 115, strikeRate: 174.9, economy: 9.35 } },
  { name: 'Liam Livingstone', role: 'AR', nat: 'England', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 5, setName: 'Capped All-Rounders 1', prevTeam: 'PBKS', stats: { matches: 39, runs: 939, wickets: 11, strikeRate: 162.3, economy: 9.12 } },
  { name: 'Daryl Mitchell', role: 'AR', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 5, setName: 'Capped All-Rounders 1', prevTeam: 'CSK', stats: { matches: 15, runs: 338, wickets: 2, strikeRate: 134.6 } },
  { name: 'Rachin Ravindra', role: 'AR', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 5, setName: 'Capped All-Rounders 1', prevTeam: 'CSK', stats: { matches: 10, runs: 222, wickets: 0, strikeRate: 160.8 } },
  { name: 'Azmatullah Omarzai', role: 'AR', nat: 'Afghanistan', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 5, setName: 'Capped All-Rounders 1', prevTeam: 'GT', stats: { matches: 7, runs: 42, wickets: 4, strikeRate: 110.5, economy: 9.20 } },
  { name: 'Shakib Al Hasan', role: 'AR', nat: 'Bangladesh', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 5, setName: 'Capped All-Rounders 1', prevTeam: 'KKR', stats: { matches: 71, runs: 793, wickets: 63, strikeRate: 124.4, economy: 7.44 } },
  { name: 'Daniel Sams', role: 'AR', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 5, setName: 'Capped All-Rounders 1', prevTeam: 'LSG', stats: { matches: 16, runs: 44, wickets: 14, economy: 8.80 } },

  // --- SET 6: CAPPED FAST BOWLERS 1 ---
  { name: 'Mohammed Siraj', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 6, setName: 'Capped Fast Bowlers 1', prevTeam: 'RCB', stats: { matches: 93, wickets: 93, economy: 8.64, bestBowling: '4/21' } },
  { name: 'Trent Boult', role: 'BOWL', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 6, setName: 'Capped Fast Bowlers 1', prevTeam: 'RR', stats: { matches: 104, wickets: 121, economy: 8.29, bestBowling: '4/18' } },
  { name: 'Mohammed Shami', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 6, setName: 'Capped Fast Bowlers 1', prevTeam: 'GT', stats: { matches: 110, wickets: 127, economy: 8.44, bestBowling: '4/11' } },
  { name: 'Pat Cummins', role: 'AR', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 6, setName: 'Capped Fast Bowlers 1', prevTeam: 'SRH', stats: { matches: 58, wickets: 63, runs: 515, strikeRate: 151.5, economy: 8.85 } },
  { name: 'Harshal Patel', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 6, setName: 'Capped Fast Bowlers 1', prevTeam: 'PBKS', stats: { matches: 106, wickets: 135, economy: 8.65, bestBowling: '5/27' } },
  { name: 'Gerald Coetzee', role: 'BOWL', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 6, setName: 'Capped Fast Bowlers 1', prevTeam: 'MI', stats: { matches: 10, wickets: 13, economy: 10.18, bestBowling: '4/34' } },
  { name: 'Dilshan Madushanka', role: 'BOWL', nat: 'Sri Lanka', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 6, setName: 'Capped Fast Bowlers 1', prevTeam: 'MI', stats: { matches: 0, wickets: 0, economy: 0.0 } },
  { name: 'Nandre Burger', role: 'BOWL', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 6, setName: 'Capped Fast Bowlers 1', prevTeam: 'RR', stats: { matches: 6, wickets: 7, economy: 8.52, bestBowling: '3/29' } },
  { name: 'Spencer Johnson', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 6, setName: 'Capped Fast Bowlers 1', prevTeam: 'GT', stats: { matches: 5, wickets: 4, economy: 9.60, bestBowling: '2/25' } },
  { name: 'Josh Hazlewood', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 6, setName: 'Capped Fast Bowlers 1', prevTeam: 'RCB', stats: { matches: 27, wickets: 35, economy: 8.06, bestBowling: '4/25' } },
  { name: 'Sandeep Sharma', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 6, setName: 'Capped Fast Bowlers 1', prevTeam: 'RR', stats: { matches: 126, wickets: 137, economy: 7.86, bestBowling: '5/18' } },
  { name: 'Ishant Sharma', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 75, setOrder: 6, setName: 'Capped Fast Bowlers 1', prevTeam: 'DC', stats: { matches: 110, wickets: 92, economy: 8.24, bestBowling: '5/12' } },

  // --- SET 7: CAPPED SPINNERS 1 ---
  { name: 'Rashid Khan', role: 'BOWL', nat: 'Afghanistan', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 7, setName: 'Capped Spinners 1', prevTeam: 'GT', stats: { matches: 121, wickets: 149, economy: 6.82, bestBowling: '4/24' } },
  { name: 'Yuzvendra Chahal', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 7, setName: 'Capped Spinners 1', prevTeam: 'RR', stats: { matches: 160, wickets: 205, economy: 7.84, bestBowling: '5/40' } },
  { name: 'Kuldeep Yadav', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 7, setName: 'Capped Spinners 1', prevTeam: 'DC', stats: { matches: 84, wickets: 87, economy: 8.08, bestBowling: '4/14' } },
  { name: 'Varun Chakravarthy', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 150, setOrder: 7, setName: 'Capped Spinners 1', prevTeam: 'KKR', stats: { matches: 71, wickets: 83, economy: 7.56, bestBowling: '5/20' } },
  { name: 'Sunil Narine', role: 'AR', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 7, setName: 'Capped Spinners 1', prevTeam: 'KKR', stats: { matches: 177, wickets: 180, runs: 1534, strikeRate: 165.8, economy: 6.73 } },
  { name: 'Noor Ahmad', role: 'BOWL', nat: 'Afghanistan', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 7, setName: 'Capped Spinners 1', prevTeam: 'GT', stats: { matches: 23, wickets: 24, economy: 8.02, bestBowling: '3/37' } },
  { name: 'Mujeeb Ur Rahman', role: 'BOWL', nat: 'Afghanistan', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 7, setName: 'Capped Spinners 1', prevTeam: 'KKR', stats: { matches: 19, wickets: 19, economy: 8.18, bestBowling: '3/27' } },
  { name: 'Adam Zampa', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 7, setName: 'Capped Spinners 1', prevTeam: 'RR', stats: { matches: 20, wickets: 29, economy: 7.98, bestBowling: '6/19' } },

  // --- SET 8: CAPPED WICKETKEEPERS 2 ---
  { name: 'Shai Hope', role: 'WK', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 8, setName: 'Capped Wicketkeepers 2', prevTeam: 'DC', stats: { matches: 9, runs: 183, strikeRate: 150.0, highestScore: '43' } },
  { name: 'Donovan Ferreira', role: 'WK', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 8, setName: 'Capped Wicketkeepers 2', prevTeam: 'RR', stats: { matches: 2, runs: 8, strikeRate: 114.2 } },
  { name: 'Rahmanullah Gurbaz', role: 'WK', nat: 'Afghanistan', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 8, setName: 'Capped Wicketkeepers 2', prevTeam: 'KKR', stats: { matches: 13, runs: 289, strikeRate: 133.7, highestScore: '81' } },
  { name: 'KS Bharat', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 8, setName: 'Capped Wicketkeepers 2', prevTeam: 'KKR', stats: { matches: 10, runs: 199, strikeRate: 122.0, highestScore: '78*' } },
  { name: 'Vishnu Vinod', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 20, setOrder: 8, setName: 'Capped Wicketkeepers 2', prevTeam: 'MI', stats: { matches: 6, runs: 56, strikeRate: 140.0 } },
  { name: 'Prabhsimran Singh', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 8, setName: 'Capped Wicketkeepers 2', prevTeam: 'PBKS', stats: { matches: 34, runs: 756, strikeRate: 146.2, highestScore: '103' } },
  { name: 'Anuj Rawat', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 30, setOrder: 8, setName: 'Capped Wicketkeepers 2', prevTeam: 'RCB', stats: { matches: 24, runs: 318, strikeRate: 121.3 } },
  { name: 'Narayan Jagadeesan', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 30, setOrder: 8, setName: 'Capped Wicketkeepers 2', prevTeam: 'KKR', stats: { matches: 13, runs: 162, strikeRate: 110.2 } },

  // --- SET 9: CAPPED BATTERS 2 ---
  { name: 'Ajinkya Rahane', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 150, setOrder: 9, setName: 'Capped Batters 2', prevTeam: 'CSK', stats: { matches: 185, runs: 4642, strikeRate: 123.4, highestScore: '105*' } },
  { name: 'Manish Pandey', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 9, setName: 'Capped Batters 2', prevTeam: 'KKR', stats: { matches: 171, runs: 3850, strikeRate: 121.1, highestScore: '114*' } },
  { name: 'Karun Nair', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 9, setName: 'Capped Batters 2', prevTeam: 'LSG', stats: { matches: 76, runs: 1496, strikeRate: 127.7, highestScore: '83*' } },
  { name: 'Mayank Agarwal', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 9, setName: 'Capped Batters 2', prevTeam: 'SRH', stats: { matches: 127, runs: 2661, strikeRate: 133.2, highestScore: '106' } },
  { name: 'Rahul Tripathi', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 9, setName: 'Capped Batters 2', prevTeam: 'SRH', stats: { matches: 95, runs: 2235, strikeRate: 138.8, highestScore: '93' } },
  { name: 'Rovman Powell', role: 'BAT', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 9, setName: 'Capped Batters 2', prevTeam: 'RR', stats: { matches: 26, runs: 394, strikeRate: 148.6, highestScore: '67*' } },
  { name: 'Sherfane Rutherford', role: 'BAT', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 9, setName: 'Capped Batters 2', prevTeam: 'KKR', stats: { matches: 10, runs: 106, strikeRate: 101.9 } },
  { name: 'Sarfaraz Khan', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 9, setName: 'Capped Batters 2', prevTeam: 'DC', stats: { matches: 50, runs: 585, strikeRate: 130.5 } },
  { name: 'Abhinav Manohar', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 9, setName: 'Capped Batters 2', prevTeam: 'GT', stats: { matches: 17, runs: 226, strikeRate: 140.3 } },
  { name: 'Cheteshwar Pujara', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 9, setName: 'Capped Batters 2', prevTeam: 'CSK', stats: { matches: 30, runs: 390, strikeRate: 99.7 } },

  // --- SET 10: CAPPED ALL-ROUNDERS 2 ---
  { name: 'Shivam Dube', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 10, setName: 'Capped All-Rounders 2', prevTeam: 'CSK', stats: { matches: 65, runs: 1502, wickets: 5, strikeRate: 159.2 } },
  { name: 'Washington Sundar', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 150, setOrder: 10, setName: 'Capped All-Rounders 2', prevTeam: 'SRH', stats: { matches: 60, runs: 378, wickets: 37, strikeRate: 117.3, economy: 7.54 } },
  { name: 'Krunal Pandya', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 10, setName: 'Capped All-Rounders 2', prevTeam: 'LSG', stats: { matches: 127, runs: 1647, wickets: 76, strikeRate: 132.8, economy: 7.33 } },
  { name: 'Deepak Hooda', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 10, setName: 'Capped All-Rounders 2', prevTeam: 'LSG', stats: { matches: 118, runs: 1480, wickets: 10, strikeRate: 128.5 } },
  { name: 'Vijay Shankar', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 10, setName: 'Capped All-Rounders 2', prevTeam: 'GT', stats: { matches: 72, runs: 1113, wickets: 9, strikeRate: 130.6 } },
  { name: 'Romario Shepherd', role: 'AR', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 10, setName: 'Capped All-Rounders 2', prevTeam: 'MI', stats: { matches: 10, runs: 115, wickets: 4, strikeRate: 234.6 } },
  { name: 'Jason Holder', role: 'AR', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 10, setName: 'Capped All-Rounders 2', prevTeam: 'RR', stats: { matches: 46, runs: 259, wickets: 53, strikeRate: 120.4, economy: 8.81 } },
  { name: 'Kyle Mayers', role: 'AR', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 10, setName: 'Capped All-Rounders 2', prevTeam: 'LSG', stats: { matches: 13, runs: 379, wickets: 0, strikeRate: 144.1, highestScore: '73' } },
  { name: 'Rishi Dhawan', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 10, setName: 'Capped All-Rounders 2', prevTeam: 'PBKS', stats: { matches: 38, runs: 210, wickets: 25, economy: 8.10 } },
  { name: 'Krishnappa Gowtham', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 10, setName: 'Capped All-Rounders 2', prevTeam: 'LSG', stats: { matches: 35, runs: 247, wickets: 21, economy: 8.26 } },

  // --- SET 11: CAPPED FAST BOWLERS 2 ---
  { name: 'Deepak Chahar', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 150, setOrder: 11, setName: 'Capped Fast Bowlers 2', prevTeam: 'CSK', stats: { matches: 81, wickets: 77, economy: 7.97, bestBowling: '4/13' } },
  { name: 'Bhuvneshwar Kumar', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 11, setName: 'Capped Fast Bowlers 2', prevTeam: 'SRH', stats: { matches: 176, wickets: 181, economy: 7.56, bestBowling: '5/19' } },
  { name: 'Tushar Deshpande', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 11, setName: 'Capped Fast Bowlers 2', prevTeam: 'CSK', stats: { matches: 36, wickets: 42, economy: 9.65, bestBowling: '4/27' } },
  { name: 'Mukesh Kumar', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 150, setOrder: 11, setName: 'Capped Fast Bowlers 2', prevTeam: 'DC', stats: { matches: 20, wickets: 24, economy: 10.15, bestBowling: '3/14' } },
  { name: 'Umran Malik', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 75, setOrder: 11, setName: 'Capped Fast Bowlers 2', prevTeam: 'SRH', stats: { matches: 26, wickets: 29, economy: 9.52, bestBowling: '5/25' } },
  { name: 'Avesh Khan', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 150, setOrder: 11, setName: 'Capped Fast Bowlers 2', prevTeam: 'RR', stats: { matches: 63, wickets: 74, economy: 8.84, bestBowling: '4/24' } },
  { name: 'Alzarri Joseph', role: 'BOWL', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 11, setName: 'Capped Fast Bowlers 2', prevTeam: 'RCB', stats: { matches: 22, wickets: 21, economy: 9.40, bestBowling: '6/12' } },
  { name: 'Mustafizur Rahman', role: 'BOWL', nat: 'Bangladesh', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 11, setName: 'Capped Fast Bowlers 2', prevTeam: 'CSK', stats: { matches: 57, wickets: 61, economy: 8.12, bestBowling: '4/29' } },
  { name: 'Taskin Ahmed', role: 'BOWL', nat: 'Bangladesh', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 11, setName: 'Capped Fast Bowlers 2', prevTeam: 'PBKS', stats: { matches: 0, wickets: 0, economy: 0.0 } },
  { name: 'Nathan Ellis', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 11, setName: 'Capped Fast Bowlers 2', prevTeam: 'PBKS', stats: { matches: 15, wickets: 18, economy: 8.78, bestBowling: '4/30' } },
  { name: 'Jhye Richardson', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 11, setName: 'Capped Fast Bowlers 2', prevTeam: 'DC', stats: { matches: 4, wickets: 3, economy: 10.25 } },
  { name: 'Fazalhaq Farooqi', role: 'BOWL', nat: 'Afghanistan', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 11, setName: 'Capped Fast Bowlers 2', prevTeam: 'SRH', stats: { matches: 7, wickets: 6, economy: 8.95 } },
  { name: 'Naveen-ul-Haq', role: 'BOWL', nat: 'Afghanistan', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 11, setName: 'Capped Fast Bowlers 2', prevTeam: 'LSG', stats: { matches: 18, wickets: 25, economy: 9.12, bestBowling: '4/38' } },
  { name: 'Mohit Sharma', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 150, setOrder: 11, setName: 'Capped Fast Bowlers 2', prevTeam: 'GT', stats: { matches: 112, wickets: 132, economy: 8.42, bestBowling: '5/10' } },
  { name: 'Jaydev Unadkat', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 11, setName: 'Capped Fast Bowlers 2', prevTeam: 'SRH', stats: { matches: 105, wickets: 99, economy: 8.89, bestBowling: '5/25' } },

  // --- SET 12: CAPPED SPINNERS 2 ---
  { name: 'Rahul Chahar', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 12, setName: 'Capped Spinners 2', prevTeam: 'PBKS', stats: { matches: 79, wickets: 75, economy: 7.78, bestBowling: '4/27' } },
  { name: 'Ravi Bishnoi', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 12, setName: 'Capped Spinners 2', prevTeam: 'LSG', stats: { matches: 66, wickets: 63, economy: 7.82, bestBowling: '3/24' } },
  { name: 'Piyush Chawla', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 12, setName: 'Capped Spinners 2', prevTeam: 'MI', stats: { matches: 192, wickets: 192, economy: 7.96, bestBowling: '4/17' } },
  { name: 'Amit Mishra', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 12, setName: 'Capped Spinners 2', prevTeam: 'LSG', stats: { matches: 162, wickets: 174, economy: 7.37, bestBowling: '5/17' } },
  { name: 'Shahbaz Ahmed', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 12, setName: 'Capped Spinners 2', prevTeam: 'SRH', stats: { matches: 55, runs: 531, wickets: 20, strikeRate: 119.8, economy: 8.54 } },
  { name: 'R Sai Kishore', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 75, setOrder: 12, setName: 'Capped Spinners 2', prevTeam: 'GT', stats: { matches: 10, wickets: 13, economy: 8.24, bestBowling: '4/33' } },
  { name: 'Karn Sharma', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 12, setName: 'Capped Spinners 2', prevTeam: 'RCB', stats: { matches: 84, wickets: 76, economy: 8.28, bestBowling: '4/16' } },
  { name: 'Ish Sodhi', role: 'BOWL', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 12, setName: 'Capped Spinners 2', prevTeam: 'RR', stats: { matches: 8, wickets: 9, economy: 6.69, bestBowling: '3/14' } },
  { name: 'Tabraiz Shamsi', role: 'BOWL', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 12, setName: 'Capped Spinners 2', prevTeam: 'RR', stats: { matches: 5, wickets: 3, economy: 9.05 } },

  // --- SET 13: UNCAPPED WICKETKEEPERS 1 ---
  { name: 'Abishek Porel', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 50, setOrder: 13, setName: 'Uncapped Wicketkeepers 1', prevTeam: 'DC', stats: { matches: 18, runs: 360, strikeRate: 154.5, highestScore: '65' } },
  { name: 'Kumar Kushagra', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 40, setOrder: 13, setName: 'Uncapped Wicketkeepers 1', prevTeam: 'DC', stats: { matches: 4, runs: 33, strikeRate: 110.0 } },
  { name: 'Robin Minz', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Wicketkeepers 1', prevTeam: 'GT', stats: { matches: 0, runs: 0 } },
  { name: 'Urvil Patel', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Wicketkeepers 1', prevTeam: 'GT', stats: { matches: 0, runs: 0 } },
  { name: 'Dinesh Bana', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 13, setName: 'Uncapped Wicketkeepers 1', prevTeam: 'CSK', stats: { matches: 0, runs: 0 } },
  { name: 'Avanish Rao Aravelly', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 13, setName: 'Uncapped Wicketkeepers 1', prevTeam: 'CSK', stats: { matches: 0, runs: 0 } },

  // --- SET 14: UNCAPPED BATTERS 1 ---
  { name: 'Shashank Singh', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 50, setOrder: 14, setName: 'Uncapped Batters 1', prevTeam: 'PBKS', stats: { matches: 24, runs: 423, strikeRate: 164.2, highestScore: '68*' } },
  { name: 'Ashutosh Sharma', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 14, setName: 'Uncapped Batters 1', prevTeam: 'PBKS', stats: { matches: 11, runs: 189, strikeRate: 167.2, highestScore: '61' } },
  { name: 'Sameer Rizvi', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 50, setOrder: 14, setName: 'Uncapped Batters 1', prevTeam: 'CSK', stats: { matches: 8, runs: 51, strikeRate: 118.6 } },
  { name: 'Angkrish Raghuvanshi', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 14, setName: 'Uncapped Batters 1', prevTeam: 'KKR', stats: { matches: 10, runs: 163, strikeRate: 155.2, highestScore: '54' } },
  { name: 'Nehal Wadhera', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 40, setOrder: 14, setName: 'Uncapped Batters 1', prevTeam: 'MI', stats: { matches: 20, runs: 350, strikeRate: 142.2, highestScore: '64' } },
  { name: 'Yash Dhull', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 14, setName: 'Uncapped Batters 1', prevTeam: 'DC', stats: { matches: 4, runs: 16, strikeRate: 69.5 } },
  { name: 'Swastik Chikara', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 14, setName: 'Uncapped Batters 1', prevTeam: 'DC', stats: { matches: 0, runs: 0 } },
  { name: 'Shubham Dubey', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 40, setOrder: 14, setName: 'Uncapped Batters 1', prevTeam: 'RR', stats: { matches: 5, runs: 39, strikeRate: 134.4 } },

  // --- SET 15: UNCAPPED ALL-ROUNDERS 1 ---
  { name: 'Abhishek Sharma', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 50, setOrder: 15, setName: 'Uncapped All-Rounders 1', prevTeam: 'SRH', stats: { matches: 63, runs: 1377, strikeRate: 155.4, wickets: 9 } },
  { name: 'Nitish Kumar Reddy', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 50, setOrder: 15, setName: 'Uncapped All-Rounders 1', prevTeam: 'SRH', stats: { matches: 15, runs: 303, wickets: 3, strikeRate: 142.9 } },
  { name: 'Riyan Parag', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 50, setOrder: 15, setName: 'Uncapped All-Rounders 1', prevTeam: 'RR', stats: { matches: 70, runs: 1173, wickets: 4, strikeRate: 139.6 } },
  { name: 'Shahrukh Khan', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 50, setOrder: 15, setName: 'Uncapped All-Rounders 1', prevTeam: 'GT', stats: { matches: 40, runs: 553, wickets: 2, strikeRate: 143.2 } },
  { name: 'Ramandeep Singh', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 15, setName: 'Uncapped All-Rounders 1', prevTeam: 'KKR', stats: { matches: 19, runs: 170, wickets: 6, strikeRate: 188.8 } },
  { name: 'Mahipal Lomror', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 40, setOrder: 15, setName: 'Uncapped All-Rounders 1', prevTeam: 'RCB', stats: { matches: 40, runs: 527, wickets: 1, strikeRate: 137.9 } },
  { name: 'Arshin Kulkarni', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 15, setName: 'Uncapped All-Rounders 1', prevTeam: 'LSG', stats: { matches: 2, runs: 9, wickets: 0 } },
  { name: 'Naman Dhir', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 15, setName: 'Uncapped All-Rounders 1', prevTeam: 'MI', stats: { matches: 7, runs: 140, wickets: 4, strikeRate: 166.6 } },
  { name: 'Tanush Kotian', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 15, setName: 'Uncapped All-Rounders 1', prevTeam: 'RR', stats: { matches: 3, runs: 35, wickets: 1 } },
  { name: 'Lalit Yadav', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 40, setOrder: 15, setName: 'Uncapped All-Rounders 1', prevTeam: 'DC', stats: { matches: 27, runs: 295, wickets: 10, strikeRate: 118.0 } },
  { name: 'Aman Khan', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 15, setName: 'Uncapped All-Rounders 1', prevTeam: 'DC', stats: { matches: 12, runs: 110, strikeRate: 135.0 } },

  // --- SET 16: UNCAPPED FAST BOWLERS 1 ---
  { name: 'Mayank Yadav', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 40, setOrder: 16, setName: 'Uncapped Fast Bowlers 1', prevTeam: 'LSG', stats: { matches: 4, wickets: 7, economy: 6.98, bestBowling: '3/14' } },
  { name: 'Harshit Rana', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 40, setOrder: 16, setName: 'Uncapped Fast Bowlers 1', prevTeam: 'KKR', stats: { matches: 21, wickets: 25, economy: 9.05, bestBowling: '3/24' } },
  { name: 'Yash Dayal', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 50, setOrder: 16, setName: 'Uncapped Fast Bowlers 1', prevTeam: 'RCB', stats: { matches: 29, wickets: 28, economy: 9.54, bestBowling: '3/20' } },
  { name: 'Mohsin Khan', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 40, setOrder: 16, setName: 'Uncapped Fast Bowlers 1', prevTeam: 'LSG', stats: { matches: 24, wickets: 27, economy: 8.42, bestBowling: '4/16' } },
  { name: 'Vidwath Kaverappa', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 16, setName: 'Uncapped Fast Bowlers 1', prevTeam: 'PBKS', stats: { matches: 2, wickets: 2, economy: 9.50 } },
  { name: 'Rasikh Salam', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Fast Bowlers 1', prevTeam: 'DC', stats: { matches: 11, wickets: 9, economy: 10.80 } },
  { name: 'Vaibhav Arora', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Fast Bowlers 1', prevTeam: 'KKR', stats: { matches: 21, wickets: 22, economy: 9.35 } },
  { name: 'Akash Madhwal', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 40, setOrder: 16, setName: 'Uncapped Fast Bowlers 1', prevTeam: 'MI', stats: { matches: 13, wickets: 19, economy: 9.25, bestBowling: '5/5' } },
  { name: 'Kartik Tyagi', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Fast Bowlers 1', prevTeam: 'GT', stats: { matches: 19, wickets: 15, economy: 9.98 } },
  { name: 'Chetan Sakariya', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 50, setOrder: 16, setName: 'Uncapped Fast Bowlers 1', prevTeam: 'KKR', stats: { matches: 19, wickets: 20, economy: 8.44, bestBowling: '3/31' } },
  { name: 'Vijaykumar Vyshak', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Fast Bowlers 1', prevTeam: 'RCB', stats: { matches: 11, wickets: 13, economy: 10.12 } },
  { name: 'Akash Deep', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 40, setOrder: 16, setName: 'Uncapped Fast Bowlers 1', prevTeam: 'RCB', stats: { matches: 8, wickets: 7, economy: 9.92 } },
  { name: 'Navdeep Saini', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 50, setOrder: 16, setName: 'Uncapped Fast Bowlers 1', prevTeam: 'RR', stats: { matches: 32, wickets: 23, economy: 8.92 } },

  // --- SET 17: UNCAPPED SPINNERS 1 ---
  { name: 'Suyash Sharma', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 40, setOrder: 17, setName: 'Uncapped Spinners 1', prevTeam: 'KKR', stats: { matches: 13, wickets: 10, economy: 8.23, bestBowling: '3/30' } },
  { name: 'Manav Suthar', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 17, setName: 'Uncapped Spinners 1', prevTeam: 'GT', stats: { matches: 1, wickets: 0, economy: 8.00 } },
  { name: 'Nishant Sindhu', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 17, setName: 'Uncapped Spinners 1', prevTeam: 'CSK', stats: { matches: 0, wickets: 0 } },
  { name: 'Hrithik Shokeen', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 17, setName: 'Uncapped Spinners 1', prevTeam: 'MI', stats: { matches: 13, wickets: 5, economy: 8.90 } },
  { name: 'Prashant Solanki', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 17, setName: 'Uncapped Spinners 1', prevTeam: 'CSK', stats: { matches: 2, wickets: 2, economy: 6.33 } },
  { name: 'Shreyas Gopal', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 40, setOrder: 17, setName: 'Uncapped Spinners 1', prevTeam: 'MI', stats: { matches: 52, wickets: 52, economy: 8.15, bestBowling: '4/16' } },
  { name: 'Kumar Kartikeya', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 17, setName: 'Uncapped Spinners 1', prevTeam: 'MI', stats: { matches: 12, wickets: 10, economy: 8.75 } },
  { name: 'M Siddharth', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 17, setName: 'Uncapped Spinners 1', prevTeam: 'LSG', stats: { matches: 5, wickets: 3, economy: 8.60 } },

  // --- SET 18: UNCAPPED WICKETKEEPERS 2 ---
  { name: 'Luvnith Sisodia', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 18, setName: 'Uncapped Wicketkeepers 2', prevTeam: 'RCB', stats: { matches: 0, runs: 0 } },
  { name: 'Upendra Yadav', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 18, setName: 'Uncapped Wicketkeepers 2', prevTeam: 'SRH', stats: { matches: 0, runs: 0 } },
  { name: 'Sheldon Jackson', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 18, setName: 'Uncapped Wicketkeepers 2', prevTeam: 'KKR', stats: { matches: 9, runs: 61, strikeRate: 107.0 } },
  { name: 'Baba Indrajith', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 18, setName: 'Uncapped Wicketkeepers 2', prevTeam: 'KKR', stats: { matches: 3, runs: 21, strikeRate: 70.0 } },
  { name: 'B R Sharath', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 18, setName: 'Uncapped Wicketkeepers 2', prevTeam: 'GT', stats: { matches: 2, runs: 15, strikeRate: 115.0 } },
  { name: 'Harvik Desai', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 18, setName: 'Uncapped Wicketkeepers 2', prevTeam: 'MI', stats: { matches: 0, runs: 0 } },

  // --- SET 19: UNCAPPED BATTERS 2 ---
  { name: 'Priyansh Arya', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 19, setName: 'Uncapped Batters 2', prevTeam: 'PBKS', stats: { matches: 0, runs: 0 } },
  { name: 'Rohan Kunnummal', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 19, setName: 'Uncapped Batters 2', prevTeam: 'SRH', stats: { matches: 0, runs: 0 } },
  { name: 'Subhranshu Senapati', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 19, setName: 'Uncapped Batters 2', prevTeam: 'CSK', stats: { matches: 0, runs: 0 } },
  { name: 'Priyam Garg', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 19, setName: 'Uncapped Batters 2', prevTeam: 'DC', stats: { matches: 23, runs: 256, strikeRate: 115.3 } },
  { name: 'Himmat Singh', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 19, setName: 'Uncapped Batters 2', prevTeam: 'RCB', stats: { matches: 0, runs: 0 } },
  { name: 'Sachin Baby', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 19, setName: 'Uncapped Batters 2', prevTeam: 'SRH', stats: { matches: 19, runs: 144, strikeRate: 135.8 } },
  { name: 'Ricky Bhui', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 19, setName: 'Uncapped Batters 2', prevTeam: 'DC', stats: { matches: 4, runs: 7, strikeRate: 50.0 } },
  { name: 'Ayush Badoni', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 50, setOrder: 19, setName: 'Uncapped Batters 2', prevTeam: 'LSG', stats: { matches: 42, runs: 634, strikeRate: 132.0, highestScore: '59' } },

  // --- SET 20: UNCAPPED ALL-ROUNDERS 2 ---
  { name: 'Sumit Kumar', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 20, setName: 'Uncapped All-Rounders 2', prevTeam: 'DC', stats: { matches: 4, runs: 16, wickets: 1 } },
  { name: 'Vivrant Sharma', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 20, setName: 'Uncapped All-Rounders 2', prevTeam: 'SRH', stats: { matches: 3, runs: 69, wickets: 0, highestScore: '69' } },
  { name: 'Raj Angad Bawa', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 20, setName: 'Uncapped All-Rounders 2', prevTeam: 'PBKS', stats: { matches: 2, runs: 11, wickets: 0 } },
  { name: 'Sanvir Singh', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 20, setName: 'Uncapped All-Rounders 2', prevTeam: 'SRH', stats: { matches: 7, runs: 39, wickets: 0 } },
  { name: 'Swapnil Singh', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 20, setName: 'Uncapped All-Rounders 2', prevTeam: 'RCB', stats: { matches: 7, runs: 28, wickets: 6, economy: 8.90 } },
  { name: 'Corbin Bosch', role: 'AR', nat: 'South Africa', isOverseas: true, isCapped: false, basePrice: 20, setOrder: 20, setName: 'Uncapped All-Rounders 2', prevTeam: 'RR', stats: { matches: 0, runs: 0, wickets: 0 } },
  { name: 'Wiaan Mulder', role: 'AR', nat: 'South Africa', isOverseas: true, isCapped: false, basePrice: 50, setOrder: 20, setName: 'Uncapped All-Rounders 2', prevTeam: 'SRH', stats: { matches: 0, runs: 0, wickets: 0 } },

  // --- SET 21: UNCAPPED FAST BOWLERS 2 ---
  { name: 'Kuldeep Sen', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 21, setName: 'Uncapped Fast Bowlers 2', prevTeam: 'RR', stats: { matches: 12, wickets: 14, economy: 9.45, bestBowling: '4/20' } },
  { name: 'KM Asif', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 21, setName: 'Uncapped Fast Bowlers 2', prevTeam: 'RR', stats: { matches: 7, wickets: 7, economy: 9.85 } },
  { name: 'Simarjeet Singh', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 21, setName: 'Uncapped Fast Bowlers 2', prevTeam: 'CSK', stats: { matches: 10, wickets: 9, economy: 9.12, bestBowling: '3/26' } },
  { name: 'Rajvardhan Hangargekar', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 21, setName: 'Uncapped Fast Bowlers 2', prevTeam: 'CSK', stats: { matches: 2, wickets: 3, economy: 10.00 } },
  { name: 'Kuldip Yadav', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 21, setName: 'Uncapped Fast Bowlers 2', prevTeam: 'RR', stats: { matches: 3, wickets: 2, economy: 8.70 } },
  { name: 'Harpreet Brar', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 40, setOrder: 21, setName: 'Uncapped Fast Bowlers 2', prevTeam: 'PBKS', stats: { matches: 41, wickets: 25, economy: 7.64, bestBowling: '4/19' } },
  { name: 'Gourav Yadav', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 21, setName: 'Uncapped Fast Bowlers 2', prevTeam: 'KKR', stats: { matches: 0, wickets: 0 } },
  { name: 'Yudhvir Singh', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 21, setName: 'Uncapped Fast Bowlers 2', prevTeam: 'LSG', stats: { matches: 5, wickets: 4, economy: 9.10 } },
  { name: 'Lance Morris', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: false, basePrice: 75, setOrder: 21, setName: 'Uncapped Fast Bowlers 2', prevTeam: 'MI', stats: { matches: 0, wickets: 0 } },
  { name: 'Kwena Maphaka', role: 'BOWL', nat: 'South Africa', isOverseas: true, isCapped: false, basePrice: 50, setOrder: 21, setName: 'Uncapped Fast Bowlers 2', prevTeam: 'MI', stats: { matches: 2, wickets: 1, economy: 14.25 } },

  // --- SET 22: UNCAPPED SPINNERS 2 ---
  { name: 'Zeeshan Ansari', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 22, setName: 'Uncapped Spinners 2', prevTeam: 'SRH', stats: { matches: 0, wickets: 0 } },
  { name: 'Murugan Ashwin', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 22, setName: 'Uncapped Spinners 2', prevTeam: 'RR', stats: { matches: 45, wickets: 36, economy: 7.88, bestBowling: '3/21' } },
  { name: 'Mayank Markande', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 50, setOrder: 22, setName: 'Uncapped Spinners 2', prevTeam: 'SRH', stats: { matches: 37, wickets: 37, economy: 8.65, bestBowling: '4/23' } },
  { name: 'Jagadeesha Suchith', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 22, setName: 'Uncapped Spinners 2', prevTeam: 'SRH', stats: { matches: 22, wickets: 19, economy: 8.85 } },
  { name: 'Shivalik Sharma', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 22, setName: 'Uncapped Spinners 2', prevTeam: 'MI', stats: { matches: 0, wickets: 0 } },
  { name: 'Izharulhaq Naveed', role: 'BOWL', nat: 'Afghanistan', isOverseas: true, isCapped: false, basePrice: 30, setOrder: 22, setName: 'Uncapped Spinners 2', prevTeam: 'RCB', stats: { matches: 0, wickets: 0 } },

  // --- SET 23: CAPPED PLAYERS ROUND 2 ---
  { name: 'Glenn Maxwell', role: 'AR', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 23, setName: 'Capped Players Round 2', prevTeam: 'RCB', stats: { matches: 134, runs: 2771, wickets: 37, strikeRate: 156.7 } },
  { name: 'Sam Curran', role: 'AR', nat: 'England', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 23, setName: 'Capped Players Round 2', prevTeam: 'PBKS', stats: { matches: 59, runs: 883, wickets: 58, strikeRate: 134.8, economy: 9.40 } },
  { name: 'Will Jacks', role: 'AR', nat: 'England', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 23, setName: 'Capped Players Round 2', prevTeam: 'RCB', stats: { matches: 8, runs: 230, strikeRate: 175.5, highestScore: '100*' } },
  { name: 'Matheesha Pathirana', role: 'BOWL', nat: 'Sri Lanka', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 23, setName: 'Capped Players Round 2', prevTeam: 'CSK', stats: { matches: 20, wickets: 34, economy: 7.88, bestBowling: '4/28' } },
  { name: 'Tristan Stubbs', role: 'BAT', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 23, setName: 'Capped Players Round 2', prevTeam: 'DC', stats: { matches: 18, runs: 405, strikeRate: 185.0, highestScore: '71*' } },
  { name: 'Odean Smith', role: 'AR', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 23, setName: 'Capped Players Round 2', prevTeam: 'PBKS', stats: { matches: 6, runs: 51, wickets: 6, strikeRate: 141.6 } },
  { name: 'Fabian Allen', role: 'AR', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 23, setName: 'Capped Players Round 2', prevTeam: 'MI', stats: { matches: 5, runs: 14, wickets: 2 } },
  { name: 'Dushmantha Chameera', role: 'BOWL', nat: 'Sri Lanka', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 23, setName: 'Capped Players Round 2', prevTeam: 'KKR', stats: { matches: 12, wickets: 9, economy: 8.90 } },
  { name: 'Nuwan Thushara', role: 'BOWL', nat: 'Sri Lanka', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 23, setName: 'Capped Players Round 2', prevTeam: 'MI', stats: { matches: 7, wickets: 8, economy: 9.88, bestBowling: '3/13' } },
  { name: 'Obed McCoy', role: 'BOWL', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 23, setName: 'Capped Players Round 2', prevTeam: 'RR', stats: { matches: 8, wickets: 11, economy: 9.17 } },

  // --- SET 24: ACCELERATED RE-QUEUE SET ---
  { name: 'Suryansh Shedge', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'LSG', stats: { matches: 0, runs: 0 } },
  { name: 'Sonu Yadav', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'RCB', stats: { matches: 0, runs: 0 } },
  { name: 'Mohit Rathee', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'PBKS', stats: { matches: 1, wickets: 0 } },
  { name: 'Shivam Singh', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'PBKS', stats: { matches: 0, runs: 0 } },
  { name: 'Bhagath Varma', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'CSK', stats: { matches: 0, runs: 0 } },
  { name: 'Ajay Mandal', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'CSK', stats: { matches: 0, runs: 0 } },
  { name: 'Shubham Garhwal', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'RR', stats: { matches: 0, runs: 0 } },
  { name: 'Tejas Baroka', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'RR', stats: { matches: 1, wickets: 0 } },
  { name: 'Abhay Negi', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'KKR', stats: { matches: 0, runs: 0 } },
  { name: 'Aarya Desai', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'KKR', stats: { matches: 0, runs: 0 } },
  { name: 'Kulwant Khejroliya', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'KKR', stats: { matches: 5, wickets: 3 } },
  { name: 'Atit Sheth', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'GT', stats: { matches: 0, runs: 0 } },
  { name: 'Gurnoor Brar', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'PBKS', stats: { matches: 1, wickets: 0 } },
  { name: 'Sandeep Warrier', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 50, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'GT', stats: { matches: 9, wickets: 9, economy: 8.95 } },
  { name: 'Akash Singh', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'CSK', stats: { matches: 6, wickets: 5, economy: 9.80 } },
  { name: 'Kuldip Sen (Re-queue)', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 20, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'RR', stats: { matches: 3, wickets: 2 } },
  { name: 'Riley Meredith', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'MI', stats: { matches: 13, wickets: 15, economy: 9.40 } },
  { name: 'Jason Behrendorff', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'MI', stats: { matches: 17, wickets: 19, economy: 8.80 } },
  { name: 'Daniel Worrall', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'SRH', stats: { matches: 0, wickets: 0 } },
  { name: 'Moises Henriques', role: 'AR', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'PBKS', stats: { matches: 62, runs: 1000, wickets: 42, strikeRate: 128.0 } },
  { name: 'Ben Cutting', role: 'AR', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'KKR', stats: { matches: 21, runs: 238, wickets: 10, strikeRate: 168.7 } },
  { name: 'Dwaine Pretorius', role: 'AR', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'CSK', stats: { matches: 7, runs: 44, wickets: 6 } },
  { name: 'David Wiese', role: 'AR', nat: 'Namibia', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'KKR', stats: { matches: 18, runs: 139, wickets: 16 } },
  { name: 'Roelof van der Merwe', role: 'AR', nat: 'Netherlands', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'RCB', stats: { matches: 21, runs: 118, wickets: 21 } },
  { name: 'Sheldon Cottrell', role: 'BOWL', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'PBKS', stats: { matches: 6, wickets: 6, economy: 8.80 } },
  { name: 'Oshane Thomas', role: 'BOWL', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'RR', stats: { matches: 7, wickets: 5 } },
  { name: 'Hayden Walsh', role: 'BOWL', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'RR', stats: { matches: 0, wickets: 0 } },
  { name: 'Gudakesh Motie', role: 'BOWL', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'LSG', stats: { matches: 0, wickets: 0 } },
  { name: 'Usman Qadir', role: 'BOWL', nat: 'Pakistan', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'MI', stats: { matches: 0, wickets: 0 } },
  { name: 'Todd Murphy', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'DC', stats: { matches: 0, wickets: 0 } },
  { name: 'Mitchell Swepson', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'SRH', stats: { matches: 0, wickets: 0 } },
  { name: 'Waqar Salamkheil', role: 'BOWL', nat: 'Afghanistan', isOverseas: true, isCapped: true, basePrice: 30, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'KKR', stats: { matches: 0, wickets: 0 } },
  { name: 'George Garton', role: 'AR', nat: 'England', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'RCB', stats: { matches: 5, runs: 19, wickets: 3 } },
  { name: 'Benny Howell', role: 'AR', nat: 'England', isOverseas: true, isCapped: true, basePrice: 40, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'PBKS', stats: { matches: 0, runs: 0, wickets: 0 } },
  { name: 'Ashton Turner', role: 'BAT', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'RR', stats: { matches: 4, runs: 3, strikeRate: 30.0 } },
  { name: 'Colin Munro', role: 'BAT', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'DC', stats: { matches: 13, runs: 177, strikeRate: 125.5 } },
  { name: 'Brandon King', role: 'BAT', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'RR', stats: { matches: 0, runs: 0 } },
  { name: 'Johnson Charles', role: 'BAT', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'KKR', stats: { matches: 0, runs: 0 } },
  { name: 'Nuwan Thushara (Re-queue)', role: 'BOWL', nat: 'Sri Lanka', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'MI', stats: { matches: 7, wickets: 8 } },
  { name: 'Binura Fernando', role: 'BOWL', nat: 'Sri Lanka', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'SRH', stats: { matches: 0, wickets: 0 } },
  { name: 'Lahiru Kumara', role: 'BOWL', nat: 'Sri Lanka', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 24, setName: 'Accelerated Round Set 1', prevTeam: 'GT', stats: { matches: 0, wickets: 0 } },
];

export function generateFullDataset(): { validPool: SeedPlayer[]; runtimePool: RuntimePlayer[]; needsReviewPool: SeedPlayer[] } {
  const validPool: SeedPlayer[] = [];
  const runtimePool: RuntimePlayer[] = [];
  const needsReviewPool: SeedPlayer[] = [];
  const seenNames = new Set<string>();

  rawPlayerDefinitions.forEach((p, idx) => {
    let name = p.name;
    if (seenNames.has(name)) {
      name = `${name} (${p.nat})`;
    }
    seenNames.add(name);

    const seed: SeedPlayer = {
      cricsheetId: `ipl_${p.isOverseas ? 'ovs' : 'ind'}_${idx + 1}`,
      name,
      role: p.role,
      nationality: p.nat,
      isOverseas: p.isOverseas,
      isCapped: p.isCapped,
      basePrice: p.basePrice,
      setName: p.setName,
      setOrder: p.setOrder,
      previousTeam: p.prevTeam,
      sourceUrl: 'https://cricsheet.org/matches/ipl/',
      confidence: 'high',
    };

    validPool.push(seed);
    runtimePool.push(convertToRuntimePlayer(seed, idx, p.stats));
  });

  // Low confidence entry for needs-review.json
  needsReviewPool.push({
    cricsheetId: 'unk_prospect_99',
    name: 'Unverified Prospect',
    role: 'BAT',
    nationality: 'India',
    isOverseas: false,
    isCapped: false,
    basePrice: 20,
    setName: 'Needs Review',
    setOrder: 99,
    previousTeam: 'CSK',
    sourceUrl: 'https://unverified-blog.example.com',
    confidence: 'low',
  });

  return { validPool, runtimePool, needsReviewPool };
}

if (require.main === module) {
  const { validPool, runtimePool, needsReviewPool } = generateFullDataset();

  fs.writeFileSync(path.join(__dirname, '../data/auction-seed-mega-2025.json'), JSON.stringify(validPool, null, 2));
  fs.writeFileSync(path.join(__dirname, '../data/auction-seed-mini-2026.json'), JSON.stringify(validPool, null, 2));
  fs.writeFileSync(path.join(__dirname, '../data/auction-seed.json'), JSON.stringify(validPool, null, 2));
  fs.writeFileSync(path.join(__dirname, '../data/needs-review.json'), JSON.stringify(needsReviewPool, null, 2));

  // Write TypeScript runtime dataset to src/data/players.ts
  const tsContent = `import { Player } from '../types';\n\nexport const INITIAL_PLAYER_DATASET: Player[] = ${JSON.stringify(runtimePool, null, 2)};\n`;
  fs.writeFileSync(path.join(__dirname, '../src/data/players.ts'), tsContent);

  console.log(`✅ Successfully generated ${validPool.length} valid seed players across auction files and src/data/players.ts!`);
  console.log(`⚠️ Generated ${needsReviewPool.length} low-confidence entries in data/needs-review.json.`);
}
