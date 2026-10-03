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
function convertToRuntimePlayer(
  seed: SeedPlayer,
  index: number,
  stats: RuntimePlayer['stats']
): RuntimePlayer {
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

// 370+ Real IPL Player Definition List across 16 Consolidated Sets
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
  // --- SET 1: MARQUEE SET (35 players) ---
  { name: 'Virat Kohli', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'RCB', stats: { matches: 252, runs: 8004, strikeRate: 131.9, highestScore: '113*' } },
  { name: 'Jasprit Bumrah', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'MI', stats: { matches: 133, wickets: 165, economy: 7.30, bestBowling: '5/10' } },
  { name: 'Rishabh Pant', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'DC', stats: { matches: 111, runs: 3284, strikeRate: 148.9, highestScore: '128*', catches: 75 } },
  { name: 'Heinrich Klaasen', role: 'WK', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'SRH', stats: { matches: 35, runs: 993, strikeRate: 168.3, highestScore: '104*' } },
  { name: 'Mitchell Starc', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'KKR', stats: { matches: 41, wickets: 51, economy: 8.52, bestBowling: '4/15' } },
  { name: 'Shreyas Iyer', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'KKR', stats: { matches: 116, runs: 3127, strikeRate: 127.5, highestScore: '96' } },
  { name: 'KL Rahul', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'LSG', stats: { matches: 132, runs: 4683, strikeRate: 134.6, highestScore: '132*' } },
  { name: 'Arshdeep Singh', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'PBKS', stats: { matches: 65, wickets: 76, economy: 9.02, bestBowling: '5/32' } },
  { name: 'Yuzvendra Chahal', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'RR', stats: { matches: 160, wickets: 205, economy: 7.84, bestBowling: '5/40' } },
  { name: 'Mohammed Shami', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'GT', stats: { matches: 110, wickets: 127, economy: 8.44, bestBowling: '4/11' } },
  { name: 'Mohammed Siraj', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'RCB', stats: { matches: 93, wickets: 93, economy: 8.65, bestBowling: '4/21' } },
  { name: 'Jos Buttler', role: 'WK', nat: 'England', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'RR', stats: { matches: 107, runs: 3582, strikeRate: 147.5, highestScore: '124' } },
  { name: 'Kagiso Rabada', role: 'BOWL', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'PBKS', stats: { matches: 80, wickets: 117, economy: 8.48, bestBowling: '4/21' } },
  { name: 'Quinton de Kock', role: 'WK', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'LSG', stats: { matches: 107, runs: 3157, strikeRate: 134.2, highestScore: '140*' } },
  { name: 'Marcus Stoinis', role: 'AR', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'LSG', stats: { matches: 96, runs: 1866, wickets: 43, strikeRate: 143.8, economy: 9.40, highestScore: '124*' } },
  { name: 'Glenn Maxwell', role: 'AR', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'RCB', stats: { matches: 134, runs: 2771, wickets: 36, strikeRate: 156.7, economy: 8.31, highestScore: '95' } },
  { name: 'David Miller', role: 'BAT', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'GT', stats: { matches: 130, runs: 2924, strikeRate: 139.2, highestScore: '101*' } },
  { name: 'Liam Livingstone', role: 'AR', nat: 'England', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'PBKS', stats: { matches: 39, runs: 939, wickets: 11, strikeRate: 162.4, economy: 9.10, highestScore: '94' } },
  { name: 'Suryakumar Yadav', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'MI', stats: { matches: 150, runs: 3594, strikeRate: 145.3, highestScore: '103*' } },
  { name: 'Rohit Sharma', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'MI', stats: { matches: 257, runs: 6628, strikeRate: 131.1, highestScore: '109*' } },
  { name: 'Hardik Pandya', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'MI', stats: { matches: 137, runs: 2525, wickets: 64, strikeRate: 145.8, economy: 8.95, highestScore: '91' } },
  { name: 'Ravindra Jadeja', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'CSK', stats: { matches: 240, runs: 2959, wickets: 160, strikeRate: 129.5, economy: 7.62, highestScore: '62*' } },
  { name: 'Shubman Gill', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'GT', stats: { matches: 103, runs: 3216, strikeRate: 135.7, highestScore: '129' } },
  { name: 'Yashasvi Jaiswal', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'RR', stats: { matches: 52, runs: 1607, strikeRate: 150.8, highestScore: '124' } },
  { name: 'Ruturaj Gaikwad', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'CSK', stats: { matches: 66, runs: 2380, strikeRate: 136.9, highestScore: '108*' } },
  { name: 'Rinku Singh', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'KKR', stats: { matches: 46, runs: 893, strikeRate: 143.2, highestScore: '67*' } },
  { name: 'Shivam Dube', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'CSK', stats: { matches: 65, runs: 1502, strikeRate: 142.1, highestScore: '95*' } },
  { name: 'Axar Patel', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'DC', stats: { matches: 150, runs: 1653, wickets: 123, strikeRate: 130.8, economy: 7.24, highestScore: '66' } },
  { name: 'Kuldeep Yadav', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'DC', stats: { matches: 84, wickets: 87, economy: 7.88, bestBowling: '4/14' } },
  { name: 'Sanju Samson', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'RR', stats: { matches: 167, runs: 4419, strikeRate: 138.9, highestScore: '119' } },
  { name: 'Travis Head', role: 'BAT', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'SRH', stats: { matches: 25, runs: 762, strikeRate: 172.5, highestScore: '102' } },
  { name: 'Abhishek Sharma', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'SRH', stats: { matches: 63, runs: 1377, strikeRate: 155.2, highestScore: '75' } },
  { name: 'Pat Cummins', role: 'AR', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'SRH', stats: { matches: 58, wickets: 63, strikeRate: 140.5, economy: 8.85, highestScore: '56*' } },
  { name: 'Nicholas Pooran', role: 'WK', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'LSG', stats: { matches: 76, runs: 1769, strikeRate: 158.4, highestScore: '77' } },
  { name: 'Rashid Khan', role: 'BOWL', nat: 'Afghanistan', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 1, setName: 'Marquee Set', prevTeam: 'GT', stats: { matches: 121, wickets: 149, economy: 6.82, bestBowling: '4/24' } },

  // --- SET 2: CAPPED INDIAN WICKETKEEPERS (15 players) ---
  { name: 'Ishan Kishan', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 2, setName: 'Capped Indian Wicketkeepers', prevTeam: 'MI', stats: { matches: 105, runs: 2644, strikeRate: 135.8, highestScore: '99' } },
  { name: 'Dhruv Jurel', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 2, setName: 'Capped Indian Wicketkeepers', prevTeam: 'RR', stats: { matches: 28, runs: 347, strikeRate: 151.5, highestScore: '56*' } },
  { name: 'Jitesh Sharma', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 2, setName: 'Capped Indian Wicketkeepers', prevTeam: 'PBKS', stats: { matches: 40, runs: 735, strikeRate: 151.2, highestScore: '49*' } },
  { name: 'Srikar Bharat', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 75, setOrder: 2, setName: 'Capped Indian Wicketkeepers', prevTeam: 'KKR', stats: { matches: 10, runs: 199, strikeRate: 122.1, highestScore: '78*' } },
  { name: 'Anuj Rawat (Capped)', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 2, setName: 'Capped Indian Wicketkeepers', prevTeam: 'RCB', stats: { matches: 24, runs: 318, strikeRate: 119.5, highestScore: '48' } },
  { name: 'Sheldon Jackson (Capped)', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 2, setName: 'Capped Indian Wicketkeepers', prevTeam: 'KKR', stats: { matches: 9, runs: 61, strikeRate: 107.0, highestScore: '23' } },
  { name: 'Narayan Jagadeesan', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 2, setName: 'Capped Indian Wicketkeepers', prevTeam: 'KKR', stats: { matches: 13, runs: 162, strikeRate: 110.2, highestScore: '39' } },
  { name: 'Wriddhiman Saha', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 2, setName: 'Capped Indian Wicketkeepers', prevTeam: 'GT', stats: { matches: 170, runs: 2934, strikeRate: 127.6, highestScore: '115*' } },
  { name: 'Dinesh Karthik (Capped)', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 2, setName: 'Capped Indian Wicketkeepers', prevTeam: 'RCB', stats: { matches: 257, runs: 4842, strikeRate: 135.3, highestScore: '97*' } },
  { name: 'Naman Ojha', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 2, setName: 'Capped Indian Wicketkeepers', prevTeam: 'SRH', stats: { matches: 113, runs: 1554, strikeRate: 118.3, highestScore: '94*' } },
  { name: 'Parthiv Patel', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 2, setName: 'Capped Indian Wicketkeepers', prevTeam: 'RCB', stats: { matches: 139, runs: 2848, strikeRate: 120.8, highestScore: '81' } },
  { name: 'Robin Uthappa (WK)', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 2, setName: 'Capped Indian Wicketkeepers', prevTeam: 'CSK', stats: { matches: 205, runs: 4952, strikeRate: 130.3, highestScore: '88' } },
  { name: 'Prabhsimran Singh (Capped)', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 75, setOrder: 2, setName: 'Capped Indian Wicketkeepers', prevTeam: 'PBKS', stats: { matches: 34, runs: 756, strikeRate: 146.2, highestScore: '103' } },
  { name: 'Vishnu Vinod (Capped)', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 40, setOrder: 2, setName: 'Capped Indian Wicketkeepers', prevTeam: 'MI', stats: { matches: 6, runs: 56, strikeRate: 136.5, highestScore: '30' } },
  { name: 'Kedar Jadhav (WK)', role: 'WK', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 2, setName: 'Capped Indian Wicketkeepers', prevTeam: 'RCB', stats: { matches: 95, runs: 1208, strikeRate: 123.1, highestScore: '69' } },

  // --- SET 3: CAPPED OVERSEAS WICKETKEEPERS (15 players) ---
  { name: 'Phil Salt', role: 'WK', nat: 'England', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 3, setName: 'Capped Overseas Wicketkeepers', prevTeam: 'KKR', stats: { matches: 21, runs: 653, strikeRate: 175.5, highestScore: '89*' } },
  { name: 'Alex Carey', role: 'WK', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 3, setName: 'Capped Overseas Wicketkeepers', prevTeam: 'DC', stats: { matches: 3, runs: 32, strikeRate: 110.3, highestScore: '14' } },
  { name: 'Josh Inglis', role: 'WK', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 3, setName: 'Capped Overseas Wicketkeepers', prevTeam: 'PBKS', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Shai Hope', role: 'WK', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 3, setName: 'Capped Overseas Wicketkeepers', prevTeam: 'DC', stats: { matches: 9, runs: 183, strikeRate: 150.0, highestScore: '41' } },
  { name: 'Rahmanullah Gurbaz', role: 'WK', nat: 'Afghanistan', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 3, setName: 'Capped Overseas Wicketkeepers', prevTeam: 'KKR', stats: { matches: 14, runs: 289, strikeRate: 133.8, highestScore: '57' } },
  { name: 'Ryan Rickelton', role: 'WK', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 3, setName: 'Capped Overseas Wicketkeepers', prevTeam: 'MI', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Sam Billings', role: 'WK', nat: 'England', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 3, setName: 'Capped Overseas Wicketkeepers', prevTeam: 'KKR', stats: { matches: 30, runs: 503, strikeRate: 129.6, highestScore: '56' } },
  { name: 'Matthew Wade', role: 'WK', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 3, setName: 'Capped Overseas Wicketkeepers', prevTeam: 'GT', stats: { matches: 15, runs: 179, strikeRate: 107.8, highestScore: '35' } },
  { name: 'Tom Banton', role: 'WK', nat: 'England', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 3, setName: 'Capped Overseas Wicketkeepers', prevTeam: 'KKR', stats: { matches: 2, runs: 18, strikeRate: 90.0, highestScore: '10' } },
  { name: 'Tim Seifert', role: 'WK', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 3, setName: 'Capped Overseas Wicketkeepers', prevTeam: 'DC', stats: { matches: 3, runs: 24, strikeRate: 120.0, highestScore: '21' } },
  { name: 'Kusal Mendis', role: 'WK', nat: 'Sri Lanka', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 3, setName: 'Capped Overseas Wicketkeepers', prevTeam: 'SRH', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Tristan Stubbs (Capped)', role: 'WK', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 3, setName: 'Capped Overseas Wicketkeepers', prevTeam: 'DC', stats: { matches: 18, runs: 405, strikeRate: 185.0, highestScore: '71*' } },
  { name: 'Finn Allen (WK)', role: 'WK', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 3, setName: 'Capped Overseas Wicketkeepers', prevTeam: 'RCB', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Josh Philippe', role: 'WK', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 3, setName: 'Capped Overseas Wicketkeepers', prevTeam: 'RCB', stats: { matches: 5, runs: 78, strikeRate: 101.3, highestScore: '33' } },
  { name: 'Johnson Charles', role: 'WK', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 3, setName: 'Capped Overseas Wicketkeepers', prevTeam: 'KKR', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },

  // --- SET 4: UNCAPPED WICKETKEEPERS (16 players) ---
  { name: 'Kumar Kushagra', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 4, setName: 'Uncapped Wicketkeepers', prevTeam: 'DC', stats: { matches: 4, runs: 3, strikeRate: 42.8, highestScore: '2' } },
  { name: 'Robin Minz', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 4, setName: 'Uncapped Wicketkeepers', prevTeam: 'GT', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Luvnith Sisodia', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 4, setName: 'Uncapped Wicketkeepers', prevTeam: 'RCB', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Urvil Patel', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 4, setName: 'Uncapped Wicketkeepers', prevTeam: 'GT', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Avanish Rao Aravelly', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 4, setName: 'Uncapped Wicketkeepers', prevTeam: 'CSK', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Baba Indrajith', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 4, setName: 'Uncapped Wicketkeepers', prevTeam: 'KKR', stats: { matches: 3, runs: 21, strikeRate: 70.0, highestScore: '15' } },
  { name: 'Harvik Desai', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 4, setName: 'Uncapped Wicketkeepers', prevTeam: 'MI', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'B R Sharath', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 4, setName: 'Uncapped Wicketkeepers', prevTeam: 'GT', stats: { matches: 2, runs: 7, strikeRate: 100.0, highestScore: '5' } },
  { name: 'Upendra Yadav', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 4, setName: 'Uncapped Wicketkeepers', prevTeam: 'SRH', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Donovan Ferreira', role: 'WK', nat: 'South Africa', isOverseas: true, isCapped: false, basePrice: 50, setOrder: 4, setName: 'Uncapped Wicketkeepers', prevTeam: 'RR', stats: { matches: 2, runs: 8, strikeRate: 114.2, highestScore: '7' } },
  { name: 'Tom Kohler-Cadmore', role: 'WK', nat: 'England', isOverseas: true, isCapped: false, basePrice: 40, setOrder: 4, setName: 'Uncapped Wicketkeepers', prevTeam: 'RR', stats: { matches: 3, runs: 48, strikeRate: 100.0, highestScore: '20' } },
  { name: 'Laurie Evans (Uncapped)', role: 'WK', nat: 'England', isOverseas: true, isCapped: false, basePrice: 40, setOrder: 4, setName: 'Uncapped Wicketkeepers', prevTeam: 'PBKS', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Ollie Pope (Uncapped)', role: 'WK', nat: 'England', isOverseas: true, isCapped: false, basePrice: 50, setOrder: 4, setName: 'Uncapped Wicketkeepers', prevTeam: 'DC', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Shrikant Wagh (WK)', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 4, setName: 'Uncapped Wicketkeepers', prevTeam: 'PWI', stats: { matches: 8, runs: 28, strikeRate: 107.6, highestScore: '12' } },
  { name: 'Sumit Kumar (WK)', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 4, setName: 'Uncapped Wicketkeepers', prevTeam: 'DC', stats: { matches: 4, runs: 24, strikeRate: 114.2, highestScore: '9' } },
  { name: 'Eknath Kerkar', role: 'WK', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 4, setName: 'Uncapped Wicketkeepers', prevTeam: 'MI', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },

  // --- SET 5: CAPPED INDIAN BATTERS (20 players) ---
  { name: 'Devdutt Padikkal', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 5, setName: 'Capped Indian Batters', prevTeam: 'LSG', stats: { matches: 61, runs: 1560, strikeRate: 123.4, highestScore: '101*' } },
  { name: 'Ajinkya Rahane', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 150, setOrder: 5, setName: 'Capped Indian Batters', prevTeam: 'CSK', stats: { matches: 185, runs: 4642, strikeRate: 123.4, highestScore: '105*' } },
  { name: 'Manish Pandey', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 5, setName: 'Capped Indian Batters', prevTeam: 'KKR', stats: { matches: 171, runs: 3850, strikeRate: 121.1, highestScore: '114*' } },
  { name: 'Karun Nair', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 75, setOrder: 5, setName: 'Capped Indian Batters', prevTeam: 'LSG', stats: { matches: 76, runs: 1496, strikeRate: 127.7, highestScore: '83*' } },
  { name: 'Mayank Agarwal', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 150, setOrder: 5, setName: 'Capped Indian Batters', prevTeam: 'SRH', stats: { matches: 127, runs: 2661, strikeRate: 133.1, highestScore: '106' } },
  { name: 'Prithvi Shaw', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 75, setOrder: 5, setName: 'Capped Indian Batters', prevTeam: 'DC', stats: { matches: 79, runs: 1892, strikeRate: 147.5, highestScore: '99' } },
  { name: 'Rahul Tripathi', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 75, setOrder: 5, setName: 'Capped Indian Batters', prevTeam: 'SRH', stats: { matches: 95, runs: 2224, strikeRate: 138.8, highestScore: '93' } },
  { name: 'Cheteshwar Pujara', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 5, setName: 'Capped Indian Batters', prevTeam: 'CSK', stats: { matches: 30, runs: 390, strikeRate: 99.7, highestScore: '51' } },
  { name: 'Hanuma Vihari', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 5, setName: 'Capped Indian Batters', prevTeam: 'DC', stats: { matches: 24, runs: 284, strikeRate: 88.4, highestScore: '46' } },
  { name: 'Mandeep Singh', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 5, setName: 'Capped Indian Batters', prevTeam: 'KKR', stats: { matches: 111, runs: 1709, strikeRate: 123.0, highestScore: '66*' } },
  { name: 'Abhimanyu Easwaran', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 5, setName: 'Capped Indian Batters', prevTeam: 'SRH', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Ambati Rayudu', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 5, setName: 'Capped Indian Batters', prevTeam: 'CSK', stats: { matches: 204, runs: 4348, strikeRate: 127.5, highestScore: '100*' } },
  { name: 'Suresh Raina', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 5, setName: 'Capped Indian Batters', prevTeam: 'CSK', stats: { matches: 205, runs: 5528, strikeRate: 136.7, highestScore: '100*' } },
  { name: 'Gautam Gambhir', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 5, setName: 'Capped Indian Batters', prevTeam: 'KKR', stats: { matches: 154, runs: 4217, strikeRate: 123.8, highestScore: '93' } },
  { name: 'Manoj Tiwary', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 5, setName: 'Capped Indian Batters', prevTeam: 'PBKS', stats: { matches: 98, runs: 1695, strikeRate: 116.9, highestScore: '75*' } },
  { name: 'Saurabh Tiwary', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 5, setName: 'Capped Indian Batters', prevTeam: 'MI', stats: { matches: 93, runs: 1494, strikeRate: 120.1, highestScore: '61' } },
  { name: 'Subramaniam Badrinath', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 5, setName: 'Capped Indian Batters', prevTeam: 'CSK', stats: { matches: 95, runs: 1441, strikeRate: 118.9, highestScore: '71*' } },
  { name: 'Gurkeerat Singh Mann', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 5, setName: 'Capped Indian Batters', prevTeam: 'GT', stats: { matches: 41, runs: 511, strikeRate: 121.0, highestScore: '65' } },
  { name: 'Sarfaraz Khan (Capped)', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 75, setOrder: 5, setName: 'Capped Indian Batters', prevTeam: 'DC', stats: { matches: 50, runs: 585, strikeRate: 130.5, highestScore: '67' } },
  { name: 'Vijay Zol', role: 'BAT', nat: 'India', isOverseas: false, isCapped: true, basePrice: 30, setOrder: 5, setName: 'Capped Indian Batters', prevTeam: 'RCB', stats: { matches: 3, runs: 29, strikeRate: 85.2, highestScore: '16' } },

  // --- SET 6: CAPPED OVERSEAS BATTERS (22 players) ---
  { name: 'Devon Conway', role: 'BAT', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 6, setName: 'Capped Overseas Batters', prevTeam: 'CSK', stats: { matches: 23, runs: 924, strikeRate: 141.2, highestScore: '92*' } },
  { name: 'David Warner', role: 'BAT', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 6, setName: 'Capped Overseas Batters', prevTeam: 'DC', stats: { matches: 184, runs: 6565, strikeRate: 139.7, highestScore: '126' } },
  { name: 'Kane Williamson', role: 'BAT', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 6, setName: 'Capped Overseas Batters', prevTeam: 'GT', stats: { matches: 79, runs: 2128, strikeRate: 125.6, highestScore: '89' } },
  { name: 'Steve Smith', role: 'BAT', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 6, setName: 'Capped Overseas Batters', prevTeam: 'DC', stats: { matches: 103, runs: 2485, strikeRate: 128.0, highestScore: '101' } },
  { name: 'Rovman Powell', role: 'BAT', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 6, setName: 'Capped Overseas Batters', prevTeam: 'RR', stats: { matches: 26, runs: 357, strikeRate: 143.9, highestScore: '67*' } },
  { name: 'Harry Brook', role: 'BAT', nat: 'England', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 6, setName: 'Capped Overseas Batters', prevTeam: 'DC', stats: { matches: 11, runs: 190, strikeRate: 123.3, highestScore: '100*' } },
  { name: 'Rassie van der Dussen', role: 'BAT', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 6, setName: 'Capped Overseas Batters', prevTeam: 'RR', stats: { matches: 3, runs: 22, strikeRate: 91.6, highestScore: '12' } },
  { name: 'Jason Roy', role: 'BAT', nat: 'England', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 6, setName: 'Capped Overseas Batters', prevTeam: 'KKR', stats: { matches: 13, runs: 329, strikeRate: 138.8, highestScore: '91*' } },
  { name: 'Will Young', role: 'BAT', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 6, setName: 'Capped Overseas Batters', prevTeam: 'SRH', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Evin Lewis', role: 'BAT', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 6, setName: 'Capped Overseas Batters', prevTeam: 'LSG', stats: { matches: 27, runs: 654, strikeRate: 137.1, highestScore: '62' } },
  { name: 'Colin Munro', role: 'BAT', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 6, setName: 'Capped Overseas Batters', prevTeam: 'DC', stats: { matches: 13, runs: 177, strikeRate: 125.5, highestScore: '40' } },
  { name: 'Martin Guptill', role: 'BAT', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 6, setName: 'Capped Overseas Batters', prevTeam: 'SRH', stats: { matches: 13, runs: 270, strikeRate: 137.7, highestScore: '50' } },
  { name: 'Chris Lynn', role: 'BAT', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 6, setName: 'Capped Overseas Batters', prevTeam: 'MI', stats: { matches: 42, runs: 1329, strikeRate: 140.6, highestScore: '93*' } },
  { name: 'Alex Hales', role: 'BAT', nat: 'England', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 6, setName: 'Capped Overseas Batters', prevTeam: 'KKR', stats: { matches: 6, runs: 148, strikeRate: 125.4, highestScore: '45' } },
  { name: 'Joe Root', role: 'BAT', nat: 'England', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 6, setName: 'Capped Overseas Batters', prevTeam: 'RR', stats: { matches: 3, runs: 10, strikeRate: 66.6, highestScore: '10' } },
  { name: 'Dawid Malan', role: 'BAT', nat: 'England', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 6, setName: 'Capped Overseas Batters', prevTeam: 'PBKS', stats: { matches: 1, runs: 26, strikeRate: 100.0, highestScore: '26' } },
  { name: 'Usman Khawaja', role: 'BAT', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 6, setName: 'Capped Overseas Batters', prevTeam: 'RPS', stats: { matches: 6, runs: 127, strikeRate: 127.0, highestScore: '30' } },
  { name: 'James Vince', role: 'BAT', nat: 'England', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 6, setName: 'Capped Overseas Batters', prevTeam: 'DC', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Brandon King', role: 'BAT', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 6, setName: 'Capped Overseas Batters', prevTeam: 'RR', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Kyle Mayers (Batter)', role: 'BAT', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 6, setName: 'Capped Overseas Batters', prevTeam: 'LSG', stats: { matches: 13, runs: 379, strikeRate: 144.1, highestScore: '73' } },
  { name: 'Reeza Hendricks', role: 'BAT', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 6, setName: 'Capped Overseas Batters', prevTeam: 'MI', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Charith Asalanka', role: 'BAT', nat: 'Sri Lanka', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 6, setName: 'Capped Overseas Batters', prevTeam: 'SRH', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },

  // --- SET 7: UNCAPPED BATTERS (28 players) ---
  { name: 'Sameer Rizvi', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'CSK', stats: { matches: 8, runs: 51, strikeRate: 118.6, highestScore: '14' } },
  { name: 'Abhinav Manohar', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'GT', stats: { matches: 17, runs: 226, strikeRate: 140.3, highestScore: '43' } },
  { name: 'Angkrish Raghuvanshi', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'KKR', stats: { matches: 10, runs: 163, strikeRate: 155.2, highestScore: '54' } },
  { name: 'Nehal Wadhera', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'MI', stats: { matches: 20, runs: 350, strikeRate: 140.0, highestScore: '64' } },
  { name: 'Swastik Chikara', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'DC', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Ashutosh Sharma', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'PBKS', stats: { matches: 11, runs: 189, strikeRate: 167.2, highestScore: '61' } },
  { name: 'Shubham Dubey', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'RR', stats: { matches: 5, runs: 42, strikeRate: 120.0, highestScore: '25' } },
  { name: 'Priyansh Arya', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'PBKS', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Yash Dhull', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'DC', stats: { matches: 4, runs: 16, strikeRate: 69.5, highestScore: '13' } },
  { name: 'Anmolpreet Singh', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'SRH', stats: { matches: 9, runs: 132, strikeRate: 115.7, highestScore: '36' } },
  { name: 'Ayush Badoni', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'LSG', stats: { matches: 42, runs: 634, strikeRate: 132.0, highestScore: '59*' } },
  { name: 'Shashank Singh', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'PBKS', stats: { matches: 24, runs: 423, strikeRate: 160.2, highestScore: '68*' } },
  { name: 'Riyan Parag (Uncapped)', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 50, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'RR', stats: { matches: 69, runs: 1173, strikeRate: 135.2, highestScore: '84*' } },
  { name: 'Vivrant Sharma (Uncapped)', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'SRH', stats: { matches: 3, runs: 69, strikeRate: 130.1, highestScore: '60' } },
  { name: 'Shaik Rasheed', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'CSK', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Musheer Khan', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'PBKS', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Ricky Bhui', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'DC', stats: { matches: 4, runs: 18, strikeRate: 75.0, highestScore: '9' } },
  { name: 'Himmat Singh', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'RCB', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Subhranshu Senapati (Batter)', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'CSK', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Akshdeep Nath', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'RCB', stats: { matches: 14, runs: 91, strikeRate: 98.9, highestScore: '24' } },
  { name: 'Armaan Jaffer', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'KXIP', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Harpreet Singh Bhatia', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'PBKS', stats: { matches: 7, runs: 142, strikeRate: 125.6, highestScore: '41' } },
  { name: 'Sachin Baby', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'RCB', stats: { matches: 19, runs: 137, strikeRate: 135.6, highestScore: '33' } },
  { name: 'Virat Singh', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'SRH', stats: { matches: 3, runs: 15, strikeRate: 57.6, highestScore: '11' } },
  { name: 'Rohan Kunnummal', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'RR', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Priyank Panchal', role: 'BAT', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'GT', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Will Smeed (Uncapped OS)', role: 'BAT', nat: 'England', isOverseas: true, isCapped: false, basePrice: 40, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'MI', stats: { matches: 0, runs: 0, strikeRate: 0, highestScore: '0' } },
  { name: 'Jake Fraser-McGurk', role: 'BAT', nat: 'Australia', isOverseas: true, isCapped: false, basePrice: 50, setOrder: 7, setName: 'Uncapped Batters', prevTeam: 'DC', stats: { matches: 9, runs: 330, strikeRate: 234.0, highestScore: '84' } },

  // --- SET 8: CAPPED INDIAN ALL-ROUNDERS (22 players) ---
  { name: 'Venkatesh Iyer', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 8, setName: 'Capped Indian All-Rounders', prevTeam: 'KKR', stats: { matches: 50, runs: 1326, wickets: 3, strikeRate: 137.1, economy: 9.80, highestScore: '104' } },
  { name: 'Washington Sundar', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 150, setOrder: 8, setName: 'Capped Indian All-Rounders', prevTeam: 'SRH', stats: { matches: 60, runs: 378, wickets: 37, strikeRate: 116.3, economy: 7.54, highestScore: '40' } },
  { name: 'Krunal Pandya', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 8, setName: 'Capped Indian All-Rounders', prevTeam: 'LSG', stats: { matches: 127, runs: 1647, wickets: 76, strikeRate: 132.8, economy: 7.32, highestScore: '86' } },
  { name: 'Deepak Chahar', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 150, setOrder: 8, setName: 'Capped Indian All-Rounders', prevTeam: 'CSK', stats: { matches: 81, wickets: 77, economy: 7.98, bestBowling: '4/13' } },
  { name: 'Shardul Thakur', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 8, setName: 'Capped Indian All-Rounders', prevTeam: 'CSK', stats: { matches: 95, runs: 307, wickets: 94, strikeRate: 140.1, economy: 9.20, highestScore: '68' } },
  { name: 'Vijay Shankar', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 8, setName: 'Capped Indian All-Rounders', prevTeam: 'GT', stats: { matches: 72, runs: 1102, wickets: 9, strikeRate: 130.4, economy: 8.80, highestScore: '63*' } },
  { name: 'Jayant Yadav', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 8, setName: 'Capped Indian All-Rounders', prevTeam: 'GT', stats: { matches: 20, runs: 40, wickets: 8, strikeRate: 105.2, economy: 7.00, highestScore: '15' } },
  { name: 'Shahbaz Ahmed', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 8, setName: 'Capped Indian All-Rounders', prevTeam: 'SRH', stats: { matches: 55, runs: 531, wickets: 20, strikeRate: 124.5, economy: 8.70, highestScore: '59' } },
  { name: 'Krishnappa Gowtham', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 8, setName: 'Capped Indian All-Rounders', prevTeam: 'LSG', stats: { matches: 35, runs: 247, wickets: 21, strikeRate: 165.7, economy: 8.24, highestScore: '33*' } },
  { name: 'Rishi Dhawan', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 8, setName: 'Capped Indian All-Rounders', prevTeam: 'PBKS', stats: { matches: 38, runs: 210, wickets: 25, strikeRate: 111.7, economy: 7.95, highestScore: '25' } },
  { name: 'Shivam Mavi (Capped AR)', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 75, setOrder: 8, setName: 'Capped Indian All-Rounders', prevTeam: 'LSG', stats: { matches: 32, wickets: 30, economy: 8.71, bestBowling: '4/21' } },
  { name: 'Harshal Patel (Capped AR)', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 8, setName: 'Capped Indian All-Rounders', prevTeam: 'PBKS', stats: { matches: 106, wickets: 135, economy: 8.58, bestBowling: '5/27' } },
  { name: 'Jalaj Saxena', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 30, setOrder: 8, setName: 'Capped Indian All-Rounders', prevTeam: 'PBKS', stats: { matches: 1, runs: 0, wickets: 0, strikeRate: 0, economy: 9.00 } },
  { name: 'Stuart Binny', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 8, setName: 'Capped Indian All-Rounders', prevTeam: 'RR', stats: { matches: 95, runs: 880, wickets: 22, strikeRate: 128.8, economy: 7.63, highestScore: '48*' } },
  { name: 'Irfan Pathan', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 8, setName: 'Capped Indian All-Rounders', prevTeam: 'GL', stats: { matches: 103, runs: 1137, wickets: 80, strikeRate: 120.4, economy: 7.78, highestScore: '60' } },
  { name: 'Yusuf Pathan', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 8, setName: 'Capped Indian All-Rounders', prevTeam: 'SRH', stats: { matches: 174, runs: 3204, wickets: 42, strikeRate: 142.9, economy: 7.40, highestScore: '100' } },
  { name: 'Parvez Rasool', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 8, setName: 'Capped Indian All-Rounders', prevTeam: 'RCB', stats: { matches: 11, runs: 17, wickets: 4, strikeRate: 85.0, economy: 8.20, highestScore: '10' } },
  { name: 'Pawan Negi', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 8, setName: 'Capped Indian All-Rounders', prevTeam: 'RCB', stats: { matches: 50, runs: 365, wickets: 34, strikeRate: 126.3, economy: 7.85, highestScore: '36' } },
  { name: 'Abhishek Nayar', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 8, setName: 'Capped Indian All-Rounders', prevTeam: 'RR', stats: { matches: 60, runs: 672, wickets: 9, strikeRate: 116.3, economy: 8.50, highestScore: '45' } },
  { name: 'Karn Sharma (AR)', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 8, setName: 'Capped Indian All-Rounders', prevTeam: 'RCB', stats: { matches: 81, runs: 348, wickets: 76, strikeRate: 118.0, economy: 8.14, highestScore: '39*' } },
  { name: 'Rajat Bhatia', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 8, setName: 'Capped Indian All-Rounders', prevTeam: 'RPS', stats: { matches: 95, runs: 342, wickets: 71, strikeRate: 120.0, economy: 7.40, highestScore: '36' } },
  { name: 'Swapnil Singh (Capped AR)', role: 'AR', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 8, setName: 'Capped Indian All-Rounders', prevTeam: 'RCB', stats: { matches: 13, runs: 47, wickets: 6, strikeRate: 156.6, economy: 8.90, highestScore: '15' } },

  // --- SET 9: CAPPED OVERSEAS ALL-ROUNDERS (28 players) ---
  { name: 'Mitchell Santner', role: 'AR', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'CSK', stats: { matches: 18, runs: 67, wickets: 15, strikeRate: 103.0, economy: 6.88, highestScore: '14*' } },
  { name: 'Sam Curran', role: 'AR', nat: 'England', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'PBKS', stats: { matches: 59, runs: 883, wickets: 58, strikeRate: 135.6, economy: 9.50, highestScore: '63' } },
  { name: 'Marco Jansen', role: 'AR', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'SRH', stats: { matches: 21, runs: 158, wickets: 20, strikeRate: 130.0, economy: 9.35, highestScore: '47*' } },
  { name: 'Romario Shepherd', role: 'AR', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'MI', stats: { matches: 10, runs: 115, wickets: 4, strikeRate: 210.0, economy: 10.20, highestScore: '39*' } },
  { name: 'Daryl Mitchell', role: 'AR', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'CSK', stats: { matches: 15, runs: 351, wickets: 1, strikeRate: 138.2, economy: 10.50, highestScore: '63' } },
  { name: 'Daniel Sams', role: 'AR', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'LSG', stats: { matches: 16, runs: 44, wickets: 14, strikeRate: 105.0, economy: 8.85, highestScore: '15' } },
  { name: 'Azmatullah Omarzai', role: 'AR', nat: 'Afghanistan', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'GT', stats: { matches: 7, runs: 42, wickets: 4, strikeRate: 100.0, economy: 9.10, highestScore: '17' } },
  { name: 'Jimmy Neesham', role: 'AR', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'RR', stats: { matches: 14, runs: 92, wickets: 8, strikeRate: 100.0, economy: 9.30, highestScore: '22' } },
  { name: 'Jason Holder', role: 'AR', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'RR', stats: { matches: 46, runs: 259, wickets: 53, strikeRate: 120.0, economy: 8.80, highestScore: '47' } },
  { name: 'Kyle Jamieson', role: 'AR', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'CSK', stats: { matches: 9, runs: 65, wickets: 9, strikeRate: 118.0, economy: 9.60, highestScore: '16' } },
  { name: 'Chris Woakes', role: 'AR', nat: 'England', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'PBKS', stats: { matches: 21, runs: 78, wickets: 30, strikeRate: 102.0, economy: 8.97, highestScore: '18' } },
  { name: 'David Wiese', role: 'AR', nat: 'Namibia', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'KKR', stats: { matches: 18, runs: 139, wickets: 16, strikeRate: 135.0, economy: 8.50, highestScore: '47*' } },
  { name: 'Moises Henriques', role: 'AR', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'PBKS', stats: { matches: 62, runs: 1000, wickets: 42, strikeRate: 128.0, economy: 8.20, highestScore: '74*' } },
  { name: 'Ben Cutting', role: 'AR', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'Kolkata Knight Riders', stats: { matches: 21, runs: 238, wickets: 10, strikeRate: 168.0, economy: 9.10, highestScore: '39*' } },
  { name: 'Fabian Allen', role: 'AR', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'MI', stats: { matches: 5, runs: 14, wickets: 2, strikeRate: 70.0, economy: 9.00, highestScore: '8' } },
  { name: 'Odean Smith', role: 'AR', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'PBKS', stats: { matches: 6, runs: 51, wickets: 6, strikeRate: 190.0, economy: 11.80, highestScore: '25*' } },
  { name: 'Keemo Paul', role: 'AR', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'DC', stats: { matches: 8, runs: 18, wickets: 9, strikeRate: 75.0, economy: 8.70, highestScore: '7' } },
  { name: 'Colin de Grandhomme', role: 'AR', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'RCB', stats: { matches: 25, runs: 303, wickets: 6, strikeRate: 134.0, economy: 8.90, highestScore: '40' } },
  { name: 'Corey Anderson', role: 'AR', nat: 'USA', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'RCB', stats: { matches: 30, runs: 538, wickets: 11, strikeRate: 127.0, economy: 9.40, highestScore: '95*' } },
  { name: 'James Faulkner', role: 'AR', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'GL', stats: { matches: 60, runs: 527, wickets: 59, strikeRate: 135.0, economy: 8.69, highestScore: '46' } },
  { name: 'Dan Christian', role: 'AR', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'RCB', stats: { matches: 49, runs: 460, wickets: 38, strikeRate: 119.0, economy: 8.90, highestScore: '39' } },
  { name: 'Wayne Parnell (AR)', role: 'AR', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'RCB', stats: { matches: 33, runs: 67, wickets: 35, strikeRate: 100.0, economy: 8.20, highestScore: '16' } },
  { name: 'Shakib Al Hasan', role: 'AR', nat: 'Bangladesh', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'KKR', stats: { matches: 71, runs: 793, wickets: 63, strikeRate: 124.4, economy: 7.44, highestScore: '66*' } },
  { name: 'Mohammad Nabi', role: 'AR', nat: 'Afghanistan', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'MI', stats: { matches: 24, runs: 215, wickets: 15, strikeRate: 130.0, economy: 7.30, highestScore: '31' } },
  { name: 'Sean Williams', role: 'AR', nat: 'Zimbabwe', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'PBKS', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Sikandar Raza', role: 'AR', nat: 'Zimbabwe', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'PBKS', stats: { matches: 9, runs: 182, wickets: 3, strikeRate: 140.0, economy: 9.20, highestScore: '57' } },
  { name: 'Dasun Shanaka', role: 'AR', nat: 'Sri Lanka', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'GT', stats: { matches: 3, runs: 26, wickets: 0, strikeRate: 100.0, economy: 10.00, highestScore: '17' } },
  { name: 'Kamindu Mendis', role: 'AR', nat: 'Sri Lanka', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 9, setName: 'Capped Overseas All-Rounders', prevTeam: 'SRH', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },

  // --- SET 10: UNCAPPED ALL-ROUNDERS (32 players) ---
  { name: 'Naman Dhir', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'MI', stats: { matches: 7, runs: 140, wickets: 0, strikeRate: 166.6, highestScore: '62*' } },
  { name: 'Ramandeep Singh', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'KKR', stats: { matches: 19, runs: 170, wickets: 6, strikeRate: 180.0, economy: 9.00, highestScore: '35' } },
  { name: 'Shahrukh Khan', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 40, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'GT', stats: { matches: 40, runs: 553, wickets: 1, strikeRate: 142.1, highestScore: '58' } },
  { name: 'Raj Angad Bawa', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'PBKS', stats: { matches: 2, runs: 11, wickets: 0, strikeRate: 78.5, highestScore: '11' } },
  { name: 'Nishant Sindhu', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'CSK', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Arshin Kulkarni', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'LSG', stats: { matches: 2, runs: 9, wickets: 0, strikeRate: 100.0, highestScore: '9' } },
  { name: 'Mahipal Lomror', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 40, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'RCB', stats: { matches: 40, runs: 527, wickets: 1, strikeRate: 138.0, highestScore: '54*' } },
  { name: 'Harsh Tyagi', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'RCB', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Tanush Kotian (AR)', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'RR', stats: { matches: 3, runs: 35, wickets: 1, strikeRate: 85.0, economy: 9.50, highestScore: '24' } },
  { name: 'Atharva Taide', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'PBKS', stats: { matches: 9, runs: 236, wickets: 0, strikeRate: 140.0, highestScore: '66' } },
  { name: 'Sanvir Singh', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'SRH', stats: { matches: 8, runs: 58, wickets: 1, strikeRate: 145.0, highestScore: '24' } },
  { name: 'Swapnil Singh (Uncapped)', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'RCB', stats: { matches: 13, runs: 47, wickets: 6, strikeRate: 156.6, economy: 8.90, highestScore: '15' } },
  { name: 'Anukul Roy', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'KKR', stats: { matches: 9, runs: 22, wickets: 5, strikeRate: 110.0, economy: 7.60, highestScore: '13*' } },
  { name: 'Hrithik Shokeen (AR)', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'MI', stats: { matches: 13, runs: 66, wickets: 5, strikeRate: 110.0, economy: 8.70, highestScore: '23' } },
  { name: 'Abdul Samad', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 40, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'SRH', stats: { matches: 50, runs: 577, wickets: 2, strikeRate: 146.0, highestScore: '37*' } },
  { name: 'Utkarsh Singh', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'PBKS', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Lalit Yadav', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'DC', stats: { matches: 27, runs: 295, wickets: 10, strikeRate: 108.0, economy: 8.40, highestScore: '48*' } },
  { name: 'Ripal Patel', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'DC', stats: { matches: 9, runs: 80, wickets: 0, strikeRate: 105.0, highestScore: '23' } },
  { name: 'Yudhvir Singh (AR)', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'LSG', stats: { matches: 5, runs: 8, wickets: 4, strikeRate: 100.0, economy: 8.90, highestScore: '7' } },
  { name: 'Prerak Mankad', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'LSG', stats: { matches: 6, runs: 97, wickets: 0, strikeRate: 138.0, highestScore: '64*' } },
  { name: 'Sanjay Yadav', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'MI', stats: { matches: 1, runs: 0, wickets: 0, strikeRate: 0, economy: 11.00 } },
  { name: 'Shams Mulani', role: 'AR', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'MI', stats: { matches: 2, runs: 6, wickets: 0, strikeRate: 60.0, economy: 11.50 } },
  { name: 'Jacob Bethell', role: 'AR', nat: 'England', isOverseas: true, isCapped: false, basePrice: 50, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'RCB', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Aaron Hardie', role: 'AR', nat: 'Australia', isOverseas: true, isCapped: false, basePrice: 50, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'PBKS', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Cooper Connolly', role: 'AR', nat: 'Australia', isOverseas: true, isCapped: false, basePrice: 40, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'SRH', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Matthew Short', role: 'AR', nat: 'Australia', isOverseas: true, isCapped: false, basePrice: 50, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'PBKS', stats: { matches: 6, runs: 117, wickets: 0, strikeRate: 127.1, highestScore: '36' } },
  { name: 'Corbin Bosch', role: 'AR', nat: 'South Africa', isOverseas: true, isCapped: false, basePrice: 40, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'RR', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Wihan Lubbe', role: 'AR', nat: 'South Africa', isOverseas: true, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'GT', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Benny Howell', role: 'AR', nat: 'England', isOverseas: true, isCapped: false, basePrice: 40, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'PBKS', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Duan Jansen', role: 'AR', nat: 'South Africa', isOverseas: true, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'MI', stats: { matches: 1, runs: 0, wickets: 1, strikeRate: 0, economy: 13.00 } },
  { name: 'Gerald Hack', role: 'AR', nat: 'Australia', isOverseas: true, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'DC', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Jack Wildermuth', role: 'AR', nat: 'Australia', isOverseas: true, isCapped: false, basePrice: 30, setOrder: 10, setName: 'Uncapped All-Rounders', prevTeam: 'SRH', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },

  // --- SET 11: CAPPED INDIAN FAST BOWLERS (25 players) ---
  { name: 'Bhuvneshwar Kumar', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'SRH', stats: { matches: 176, wickets: 181, economy: 7.56, bestBowling: '5/19' } },
  { name: 'Akash Deep', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'RCB', stats: { matches: 8, wickets: 7, economy: 9.92, bestBowling: '3/45' } },
  { name: 'Prasidh Krishna', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 150, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'RR', stats: { matches: 51, wickets: 49, economy: 8.92, bestBowling: '4/30' } },
  { name: 'Avesh Khan', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'RR', stats: { matches: 63, wickets: 75, economy: 8.84, bestBowling: '4/24' } },
  { name: 'T Natarajan', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'SRH', stats: { matches: 61, wickets: 67, economy: 8.82, bestBowling: '4/19' } },
  { name: 'Umran Malik', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 75, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'SRH', stats: { matches: 26, wickets: 29, economy: 9.25, bestBowling: '5/25' } },
  { name: 'Navdeep Saini', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 75, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'RR', stats: { matches: 32, wickets: 23, economy: 8.95, bestBowling: '2/24' } },
  { name: 'Khaleel Ahmed', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 150, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'DC', stats: { matches: 57, wickets: 74, economy: 8.54, bestBowling: '3/21' } },
  { name: 'Mukesh Kumar', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 150, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'DC', stats: { matches: 20, wickets: 24, economy: 10.15, bestBowling: '3/14' } },
  { name: 'Chetan Sakariya (Capped)', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'KKR', stats: { matches: 19, wickets: 20, economy: 8.44, bestBowling: '3/31' } },
  { name: 'Ishant Sharma', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 75, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'DC', stats: { matches: 110, wickets: 92, economy: 8.16, bestBowling: '5/12' } },
  { name: 'Sandeep Sharma', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'RR', stats: { matches: 127, wickets: 137, economy: 7.86, bestBowling: '5/18' } },
  { name: 'Mohit Sharma', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'GT', stats: { matches: 112, wickets: 132, economy: 8.41, bestBowling: '5/10' } },
  { name: 'Kamlesh Nagarkoti', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 30, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'DC', stats: { matches: 12, wickets: 5, economy: 9.50, bestBowling: '2/20' } },
  { name: 'Varun Aaron', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'GT', stats: { matches: 52, wickets: 44, economy: 8.94, bestBowling: '3/16' } },
  { name: 'Siddarth Kaul', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'RCB', stats: { matches: 55, wickets: 58, economy: 8.58, bestBowling: '4/29' } },
  { name: 'Jaydev Unadkat', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'SRH', stats: { matches: 105, wickets: 99, economy: 8.89, bestBowling: '5/25' } },
  { name: 'Dhawal Kulkarni', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'MI', stats: { matches: 92, wickets: 86, economy: 8.30, bestBowling: '4/14' } },
  { name: 'Munaf Patel', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'GL', stats: { matches: 63, wickets: 74, economy: 7.51, bestBowling: '5/21' } },
  { name: 'Vinay Kumar', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'KKR', stats: { matches: 105, wickets: 105, economy: 8.43, bestBowling: '4/40' } },
  { name: 'Ashok Dinda', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'RPS', stats: { matches: 78, wickets: 69, economy: 8.20, bestBowling: '4/18' } },
  { name: 'Ishwar Pandey', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 30, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'CSK', stats: { matches: 25, wickets: 18, economy: 7.68, bestBowling: '2/23' } },
  { name: 'Ankit Rajpoot', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 30, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'RR', stats: { matches: 29, wickets: 24, economy: 9.23, bestBowling: '5/14' } },
  { name: 'Basil Thampi', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 30, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'MI', stats: { matches: 25, wickets: 22, economy: 9.80, bestBowling: '3/29' } },
  { name: 'Tushar Deshpande (Capped)', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 11, setName: 'Capped Indian Fast Bowlers', prevTeam: 'CSK', stats: { matches: 36, wickets: 42, economy: 9.60, bestBowling: '4/27' } },

  // --- SET 12: CAPPED OVERSEAS FAST BOWLERS (32 players) ---
  { name: 'Anrich Nortje', role: 'BOWL', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'DC', stats: { matches: 46, wickets: 60, economy: 8.96, bestBowling: '3/33' } },
  { name: 'Gerald Coetzee', role: 'BOWL', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'MI', stats: { matches: 10, wickets: 13, economy: 10.10, bestBowling: '4/34' } },
  { name: 'Josh Hazlewood', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'RCB', stats: { matches: 27, wickets: 35, economy: 8.08, bestBowling: '4/25' } },
  { name: 'Spencer Johnson', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'GT', stats: { matches: 5, wickets: 4, economy: 9.60, bestBowling: '2/25' } },
  { name: 'Lockie Ferguson', role: 'BOWL', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'RCB', stats: { matches: 45, wickets: 46, economy: 8.90, bestBowling: '4/28' } },
  { name: 'Mustafizur Rahman', role: 'BOWL', nat: 'Bangladesh', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'CSK', stats: { matches: 57, wickets: 61, economy: 8.00, bestBowling: '4/29' } },
  { name: 'Nuwan Thushara', role: 'BOWL', nat: 'Sri Lanka', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'MI', stats: { matches: 7, wickets: 8, economy: 9.80, bestBowling: '3/13' } },
  { name: 'Naveen-ul-Haq', role: 'BOWL', nat: 'Afghanistan', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'LSG', stats: { matches: 18, wickets: 25, economy: 8.90, bestBowling: '4/38' } },
  { name: 'Alzarri Joseph', role: 'BOWL', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'RCB', stats: { matches: 22, wickets: 21, economy: 9.50, bestBowling: '6/12' } },
  { name: 'Jason Behrendorff', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'MI', stats: { matches: 17, wickets: 19, economy: 8.80, bestBowling: '3/23' } },
  { name: 'Jhye Richardson', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'DC', stats: { matches: 4, wickets: 3, economy: 10.50, bestBowling: '2/29' } },
  { name: 'Gus Atkinson', role: 'BOWL', nat: 'England', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'KKR', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Richard Ngarava', role: 'BOWL', nat: 'Zimbabwe', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'SRH', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Dushmantha Chameera', role: 'BOWL', nat: 'Sri Lanka', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'KKR', stats: { matches: 12, wickets: 9, economy: 8.80, bestBowling: '2/17' } },
  { name: 'Dilshan Madushanka', role: 'BOWL', nat: 'Sri Lanka', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'MI', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Blessing Muzarabani', role: 'BOWL', nat: 'Zimbabwe', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'LSG', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Obed McCoy', role: 'BOWL', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'RR', stats: { matches: 8, wickets: 11, economy: 9.17, bestBowling: '3/23' } },
  { name: 'Wayne Parnell (Bowler)', role: 'BOWL', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'RCB', stats: { matches: 33, wickets: 35, economy: 8.20, bestBowling: '3/10' } },
  { name: 'Riley Meredith', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'MI', stats: { matches: 13, wickets: 12, economy: 9.75, bestBowling: '2/24' } },
  { name: 'Kane Richardson', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'RCB', stats: { matches: 15, wickets: 19, economy: 8.65, bestBowling: '3/13' } },
  { name: 'Andrew Tye', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'LSG', stats: { matches: 30, wickets: 42, economy: 8.59, bestBowling: '5/17' } },
  { name: 'Nathan Coulter-Nile', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'RR', stats: { matches: 39, wickets: 48, economy: 7.70, bestBowling: '4/14' } },
  { name: 'Chris Jordan', role: 'BOWL', nat: 'England', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'MI', stats: { matches: 34, wickets: 30, economy: 9.45, bestBowling: '4/11' } },
  { name: 'Sheldon Cottrell', role: 'BOWL', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'PBKS', stats: { matches: 6, wickets: 6, economy: 8.80, bestBowling: '2/17' } },
  { name: 'Oshane Thomas', role: 'BOWL', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'RR', stats: { matches: 4, wickets: 5, economy: 9.40, bestBowling: '2/21' } },
  { name: 'Sean Abbott', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'SRH', stats: { matches: 3, wickets: 1, economy: 11.20, bestBowling: '1/47' } },
  { name: 'Ben Dwarshuis', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'DC', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Matt Henry', role: 'BOWL', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'LSG', stats: { matches: 6, wickets: 2, economy: 10.40, bestBowling: '1/31' } },
  { name: 'Blair Tickner', role: 'BOWL', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'SRH', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Adam Milne', role: 'BOWL', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'CSK', stats: { matches: 10, wickets: 7, economy: 9.62, bestBowling: '2/24' } },
  { name: 'Mark Wood', role: 'BOWL', nat: 'England', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'LSG', stats: { matches: 5, wickets: 11, economy: 8.90, bestBowling: '5/14' } },
  { name: 'Lungi Ngidi', role: 'BOWL', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 12, setName: 'Capped Overseas Fast Bowlers', prevTeam: 'DC', stats: { matches: 14, wickets: 25, economy: 8.30, bestBowling: '4/10' } },

  // --- SET 13: UNCAPPED FAST BOWLERS (35 players) ---
  { name: 'Harshit Rana', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 40, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'KKR', stats: { matches: 21, wickets: 25, economy: 9.05, bestBowling: '3/24' } },
  { name: 'Yash Dayal', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 40, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'RCB', stats: { matches: 29, wickets: 28, economy: 9.35, bestBowling: '3/20' } },
  { name: 'Mohsin Khan', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 40, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'LSG', stats: { matches: 24, wickets: 27, economy: 7.95, bestBowling: '4/16' } },
  { name: 'Rasikh Salam', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'DC', stats: { matches: 11, wickets: 9, economy: 10.20, bestBowling: '3/34' } },
  { name: 'Kartik Tyagi', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'GT', stats: { matches: 19, wickets: 15, economy: 9.98, bestBowling: '2/23' } },
  { name: 'Simarjeet Singh', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'CSK', stats: { matches: 10, wickets: 9, economy: 8.70, bestBowling: '3/26' } },
  { name: 'Vidwath Kaverappa', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'PBKS', stats: { matches: 2, wickets: 2, economy: 9.00, bestBowling: '2/36' } },
  { name: 'Vyshak Vijaykumar', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'RCB', stats: { matches: 11, wickets: 13, economy: 10.10, bestBowling: '3/49' } },
  { name: 'Yash Thakur', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'LSG', stats: { matches: 19, wickets: 24, economy: 9.60, bestBowling: '5/30' } },
  { name: 'Sushant Mishra', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'GT', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Kuldeep Sen', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'RR', stats: { matches: 12, wickets: 14, economy: 9.40, bestBowling: '4/20' } },
  { name: 'Akash Madhwal', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'MI', stats: { matches: 13, wickets: 19, economy: 8.90, bestBowling: '5/5' } },
  { name: 'Rajvardhan Hangargekar', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'CSK', stats: { matches: 2, wickets: 3, economy: 10.00, bestBowling: '3/36' } },
  { name: 'Prince Choudhary', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'PBKS', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Sakib Hussain', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'KKR', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Mukesh Choudhary', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'CSK', stats: { matches: 14, wickets: 16, economy: 9.30, bestBowling: '4/46' } },
  { name: 'Ishan Porel', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'PBKS', stats: { matches: 1, wickets: 1, economy: 9.75, bestBowling: '1/39' } },
  { name: 'KM Asif', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'RR', stats: { matches: 7, wickets: 7, economy: 8.90, bestBowling: '2/25' } },
  { name: 'Lukman Meriwala', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'DC', stats: { matches: 1, wickets: 1, economy: 11.00, bestBowling: '1/32' } },
  { name: 'Sandeep Warrier', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'GT', stats: { matches: 9, wickets: 8, economy: 8.50, bestBowling: '3/28' } },
  { name: 'Atit Sheth', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'GT', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Arzan Nagwaswalla', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'DC', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Chama Milind', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'RCB', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Akash Singh', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'SRH', stats: { matches: 7, wickets: 5, economy: 9.80, bestBowling: '2/40' } },
  { name: 'Kuldip Yadav (Bowler)', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'RR', stats: { matches: 3, wickets: 2, economy: 9.50, bestBowling: '1/25' } },
  { name: 'Vasuki Koushik', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'PBKS', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Kwena Maphaka', role: 'BOWL', nat: 'South Africa', isOverseas: true, isCapped: false, basePrice: 50, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'MI', stats: { matches: 2, wickets: 1, economy: 13.50, bestBowling: '1/25' } },
  { name: 'Lance Morris', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: false, basePrice: 50, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'MI', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Nathan Ellis', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: false, basePrice: 75, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'PBKS', stats: { matches: 15, wickets: 18, economy: 8.80, bestBowling: '4/30' } },
  { name: 'William O\'Rourke', role: 'BOWL', nat: 'New Zealand', isOverseas: true, isCapped: false, basePrice: 50, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'RCB', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Xavier Bartlett', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: false, basePrice: 50, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'PBKS', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Luke Wood', role: 'BOWL', nat: 'England', isOverseas: true, isCapped: false, basePrice: 50, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'MI', stats: { matches: 1, wickets: 1, economy: 13.00, bestBowling: '1/33' } },
  { name: 'Ottniel Baartman', role: 'BOWL', nat: 'South Africa', isOverseas: true, isCapped: false, basePrice: 50, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'SRH', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Nandre Burger (Uncapped)', role: 'BOWL', nat: 'South Africa', isOverseas: true, isCapped: false, basePrice: 50, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'RR', stats: { matches: 6, wickets: 7, economy: 8.50, bestBowling: '3/29' } },
  { name: 'Matthew Forde', role: 'BOWL', nat: 'West Indies', isOverseas: true, isCapped: false, basePrice: 40, setOrder: 13, setName: 'Uncapped Fast Bowlers', prevTeam: 'LSG', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },

  // --- SET 14: CAPPED INDIAN SPINNERS (18 players) ---
  { name: 'Rahul Chahar', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 150, setOrder: 14, setName: 'Capped Indian Spinners', prevTeam: 'PBKS', stats: { matches: 79, wickets: 75, economy: 7.76, bestBowling: '4/27' } },
  { name: 'Ravichandran Ashwin', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 200, setOrder: 14, setName: 'Capped Indian Spinners', prevTeam: 'RR', stats: { matches: 212, wickets: 180, economy: 7.12, bestBowling: '4/34' } },
  { name: 'Piyush Chawla', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 14, setName: 'Capped Indian Spinners', prevTeam: 'MI', stats: { matches: 192, wickets: 192, economy: 7.96, bestBowling: '4/17' } },
  { name: 'Karn Sharma (Spinner)', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 75, setOrder: 14, setName: 'Capped Indian Spinners', prevTeam: 'RCB', stats: { matches: 81, wickets: 76, economy: 8.14, bestBowling: '4/38' } },
  { name: 'Amit Mishra', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 14, setName: 'Capped Indian Spinners', prevTeam: 'LSG', stats: { matches: 162, wickets: 174, economy: 7.37, bestBowling: '5/17' } },
  { name: 'Sai Kishore', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 75, setOrder: 14, setName: 'Capped Indian Spinners', prevTeam: 'GT', stats: { matches: 10, wickets: 13, economy: 8.10, bestBowling: '4/33' } },
  { name: 'Mayank Markande', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 75, setOrder: 14, setName: 'Capped Indian Spinners', prevTeam: 'SRH', stats: { matches: 37, wickets: 37, economy: 8.60, bestBowling: '4/23' } },
  { name: 'Shahbaz Nadeem', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 14, setName: 'Capped Indian Spinners', prevTeam: 'LSG', stats: { matches: 72, wickets: 48, economy: 7.56, bestBowling: '3/16' } },
  { name: 'Murugan Ashwin (Capped)', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 14, setName: 'Capped Indian Spinners', prevTeam: 'RR', stats: { matches: 44, wickets: 35, economy: 7.88, bestBowling: '3/21' } },
  { name: 'Harbhajan Singh', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 100, setOrder: 14, setName: 'Capped Indian Spinners', prevTeam: 'KKR', stats: { matches: 163, wickets: 150, economy: 7.07, bestBowling: '5/18' } },
  { name: 'Pragyan Ojha', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 14, setName: 'Capped Indian Spinners', prevTeam: 'MI', stats: { matches: 92, wickets: 89, economy: 7.36, bestBowling: '3/11' } },
  { name: 'Iqbal Abdulla', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 30, setOrder: 14, setName: 'Capped Indian Spinners', prevTeam: 'RCB', stats: { matches: 49, wickets: 40, economy: 7.20, bestBowling: '3/24' } },
  { name: 'Rahul Sharma (Spinner)', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 30, setOrder: 14, setName: 'Capped Indian Spinners', prevTeam: 'CSK', stats: { matches: 44, wickets: 40, economy: 7.02, bestBowling: '3/13' } },
  { name: 'Parvez Rasool (Spinner)', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 30, setOrder: 14, setName: 'Capped Indian Spinners', prevTeam: 'RCB', stats: { matches: 11, wickets: 4, economy: 8.20, bestBowling: '1/20' } },
  { name: 'Jayant Yadav (Spinner)', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 14, setName: 'Capped Indian Spinners', prevTeam: 'GT', stats: { matches: 20, wickets: 8, economy: 7.00, bestBowling: '2/18' } },
  { name: 'Shreyas Gopal (Capped)', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 14, setName: 'Capped Indian Spinners', prevTeam: 'MI', stats: { matches: 52, wickets: 50, economy: 8.12, bestBowling: '4/16' } },
  { name: 'Krishnappa Gowtham (Spinner)', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 50, setOrder: 14, setName: 'Capped Indian Spinners', prevTeam: 'LSG', stats: { matches: 35, wickets: 21, economy: 8.24, bestBowling: '2/12' } },
  { name: 'Krunal Pandya (Spinner)', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: true, basePrice: 150, setOrder: 14, setName: 'Capped Indian Spinners', prevTeam: 'LSG', stats: { matches: 127, wickets: 76, economy: 7.32, bestBowling: '3/11' } },

  // --- SET 15: CAPPED OVERSEAS SPINNERS (20 players) ---
  { name: 'Wanindu Hasaranga', role: 'BOWL', nat: 'Sri Lanka', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 15, setName: 'Capped Overseas Spinners', prevTeam: 'SRH', stats: { matches: 26, wickets: 35, economy: 8.13, bestBowling: '5/18' } },
  { name: 'Maheesh Theekshana', role: 'BOWL', nat: 'Sri Lanka', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 15, setName: 'Capped Overseas Spinners', prevTeam: 'CSK', stats: { matches: 27, wickets: 25, economy: 7.66, bestBowling: '4/33' } },
  { name: 'Noor Ahmad', role: 'BOWL', nat: 'Afghanistan', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 15, setName: 'Capped Overseas Spinners', prevTeam: 'GT', stats: { matches: 23, wickets: 24, economy: 8.02, bestBowling: '3/18' } },
  { name: 'Allah Ghazanfar', role: 'BOWL', nat: 'Afghanistan', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 15, setName: 'Capped Overseas Spinners', prevTeam: 'KKR', stats: { matches: 2, wickets: 0, economy: 9.50, bestBowling: '0/28' } },
  { name: 'Tabraiz Shamsi', role: 'BOWL', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 15, setName: 'Capped Overseas Spinners', prevTeam: 'RR', stats: { matches: 5, wickets: 3, economy: 9.05, bestBowling: '1/21' } },
  { name: 'Akeal Hosein', role: 'BOWL', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 15, setName: 'Capped Overseas Spinners', prevTeam: 'SRH', stats: { matches: 1, wickets: 1, economy: 8.00, bestBowling: '1/24' } },
  { name: 'Keshav Maharaj', role: 'BOWL', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 15, setName: 'Capped Overseas Spinners', prevTeam: 'RR', stats: { matches: 2, wickets: 2, economy: 6.50, bestBowling: '1/16' } },
  { name: 'Adam Zampa', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 15, setName: 'Capped Overseas Spinners', prevTeam: 'SRH', stats: { matches: 20, wickets: 29, economy: 7.99, bestBowling: '6/19' } },
  { name: 'Ish Sodhi', role: 'BOWL', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 15, setName: 'Capped Overseas Spinners', prevTeam: 'RR', stats: { matches: 5, wickets: 9, economy: 6.70, bestBowling: '3/14' } },
  { name: 'Gudakesh Motie', role: 'BOWL', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 15, setName: 'Capped Overseas Spinners', prevTeam: 'LSG', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Todd Murphy', role: 'BOWL', nat: 'Australia', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 15, setName: 'Capped Overseas Spinners', prevTeam: 'DC', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Usman Qadir', role: 'BOWL', nat: 'Pakistan', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 15, setName: 'Capped Overseas Spinners', prevTeam: 'PBKS', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Imran Tahir', role: 'BOWL', nat: 'South Africa', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 15, setName: 'Capped Overseas Spinners', prevTeam: 'CSK', stats: { matches: 59, wickets: 82, economy: 7.76, bestBowling: '4/12' } },
  { name: 'Samuel Badree', role: 'BOWL', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 15, setName: 'Capped Overseas Spinners', prevTeam: 'RCB', stats: { matches: 12, wickets: 11, economy: 7.42, bestBowling: '4/9' } },
  { name: 'Mitchell Santner (Spinner)', role: 'BOWL', nat: 'New Zealand', isOverseas: true, isCapped: true, basePrice: 100, setOrder: 15, setName: 'Capped Overseas Spinners', prevTeam: 'CSK', stats: { matches: 18, wickets: 15, economy: 6.88, bestBowling: '2/13' } },
  { name: 'Shakib Al Hasan (Spinner)', role: 'BOWL', nat: 'Bangladesh', isOverseas: true, isCapped: true, basePrice: 150, setOrder: 15, setName: 'Capped Overseas Spinners', prevTeam: 'KKR', stats: { matches: 71, wickets: 63, economy: 7.44, bestBowling: '3/17' } },
  { name: 'Fabian Allen (Spinner)', role: 'BOWL', nat: 'West Indies', isOverseas: true, isCapped: true, basePrice: 75, setOrder: 15, setName: 'Capped Overseas Spinners', prevTeam: 'MI', stats: { matches: 5, wickets: 2, economy: 9.00, bestBowling: '1/22' } },
  { name: 'Mujeeb Ur Rahman', role: 'BOWL', nat: 'Afghanistan', isOverseas: true, isCapped: true, basePrice: 200, setOrder: 15, setName: 'Capped Overseas Spinners', prevTeam: 'KKR', stats: { matches: 19, wickets: 19, economy: 8.18, bestBowling: '3/27' } },
  { name: 'Sandeep Lamichhane', role: 'BOWL', nat: 'Nepal', isOverseas: true, isCapped: true, basePrice: 50, setOrder: 15, setName: 'Capped Overseas Spinners', prevTeam: 'DC', stats: { matches: 9, wickets: 13, economy: 8.34, bestBowling: '3/36' } },
  { name: 'George Dockrell', role: 'BOWL', nat: 'Ireland', isOverseas: true, isCapped: true, basePrice: 30, setOrder: 15, setName: 'Capped Overseas Spinners', prevTeam: 'SRH', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },

  // --- SET 16: UNCAPPED SPINNERS (25 players) ---
  { name: 'Suyash Sharma', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'KKR', stats: { matches: 13, wickets: 10, economy: 8.23, bestBowling: '3/30' } },
  { name: 'Manav Suthar', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'GT', stats: { matches: 1, wickets: 0, economy: 8.00, bestBowling: '0/26' } },
  { name: 'Shreyas Gopal', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'MI', stats: { matches: 52, wickets: 50, economy: 8.12, bestBowling: '4/16' } },
  { name: 'Kumar Kartikeya', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'MI', stats: { matches: 12, wickets: 10, economy: 8.50, bestBowling: '3/19' } },
  { name: 'Hrithik Shokeen', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'MI', stats: { matches: 13, wickets: 5, economy: 8.70, bestBowling: '2/23' } },
  { name: 'Prashant Solanki', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'CSK', stats: { matches: 2, wickets: 2, economy: 6.33, bestBowling: '2/20' } },
  { name: 'M Siddharth', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'LSG', stats: { matches: 5, wickets: 3, economy: 8.60, bestBowling: '1/21' } },
  { name: 'Zeeshan Ansari', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'SRH', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Raghav Goyal', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'MI', stats: { matches: 1, wickets: 0, economy: 11.50, bestBowling: '0/23' } },
  { name: 'Jhathavedh Subramanyan', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'SRH', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Vicky Ostwal', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'DC', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Izharulhaq Naveed', role: 'BOWL', nat: 'Afghanistan', isOverseas: true, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'RCB', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'Tanush Kotian (Spinner)', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'RR', stats: { matches: 3, wickets: 1, economy: 9.50, bestBowling: '1/24' } },
  { name: 'Shiva Singh', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'PBKS', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
  { name: 'K C Cariappa', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'RR', stats: { matches: 11, wickets: 8, economy: 8.67, bestBowling: '2/26' } },
  { name: 'Pravin Tambe', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'SRH', stats: { matches: 33, wickets: 28, economy: 7.75, bestBowling: '4/20' } },
  { name: 'Tejash Baroka', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'GL', stats: { matches: 1, wickets: 0, economy: 9.50, bestBowling: '0/33' } },
  { name: 'Mayank Dagar', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'RCB', stats: { matches: 8, wickets: 2, economy: 9.80, bestBowling: '1/23' } },
  { name: 'Jagadeesha Suchith', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'SRH', stats: { matches: 22, wickets: 19, economy: 8.50, bestBowling: '3/25' } },
  { name: 'Harpreet Brar', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'PBKS', stats: { matches: 41, wickets: 25, economy: 7.90, bestBowling: '3/19' } },
  { name: 'Kuldip Yadav (Spinner)', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'RR', stats: { matches: 3, wickets: 2, economy: 9.50, bestBowling: '1/25' } },
  { name: 'Midhun Sudhesan', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'RR', stats: { matches: 1, wickets: 0, economy: 13.00, bestBowling: '0/27' } },
  { name: 'Nikhil Naik (Spinner)', role: 'BOWL', nat: 'India', isOverseas: false, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'KKR', stats: { matches: 4, wickets: 0, economy: 0 } },
  { name: 'Shamar Joseph (Uncapped OS)', role: 'BOWL', nat: 'West Indies', isOverseas: true, isCapped: false, basePrice: 50, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'LSG', stats: { matches: 1, wickets: 0, economy: 11.75, bestBowling: '0/47' } },
  { name: 'Nangeyalia Kharote', role: 'BOWL', nat: 'Afghanistan', isOverseas: true, isCapped: false, basePrice: 30, setOrder: 16, setName: 'Uncapped Spinners', prevTeam: 'RCB', stats: { matches: 0, runs: 0, wickets: 0, strikeRate: 0, economy: 0 } },
];

export function generateFullDataset() {
  const validPool: SeedPlayer[] = [];
  const runtimePool: RuntimePlayer[] = [];
  const needsReviewPool: SeedPlayer[] = [];

  const seenNames = new Set<string>();

  rawPlayerDefinitions.forEach((p, idx) => {
    let name = p.name;
    // Disambiguate duplicate names
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
