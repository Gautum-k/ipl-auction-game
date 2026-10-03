export interface BidIncrementRule {
  upToAmount: number; // in Rupees
  minIncrement: number; // in Rupees
}

export interface ModeRules {
  mode: 'MEGA_2025' | 'MINI_2026';
  maxPursePerTeam: number;
  minSquadSize: number; // 18
  maxSquadSize: number; // 25
  maxOverseasPlayers: number; // 8
  maxTotalRetentionsAndRtm: number; // 6 for Mega, 0 for Mini
  maxCappedRetentions: number; // 5
  maxUncappedRetentions: number; // 2
  retentionSlabs: {
    capped: number[]; // [18Cr, 14Cr, 11Cr, 18Cr, 14Cr]
    uncapped: number; // 4Cr
  };
  overseasPayCapEnabled: boolean; // Mini mode toggle
  overseasPayCapAmount: number; // ₹18 Cr
  bidIncrementRules: BidIncrementRule[];
  timerDurations: {
    biddingSeconds: number;
    resetOnBidSeconds: number;
    antiSnipeSeconds: number;
    rtmDecisionSeconds: number;
    unsoldCountdownSeconds: number;
    soldCountdownSeconds: number;
  };
}

export interface TeamOption {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
}

export const MEGA_MODE_RULES: ModeRules = {
  mode: 'MEGA_2025',
  maxPursePerTeam: 120_00_00_000, // ₹120 Crore
  minSquadSize: 18,
  maxSquadSize: 25,
  maxOverseasPlayers: 8,
  maxTotalRetentionsAndRtm: 6,
  maxCappedRetentions: 5,
  maxUncappedRetentions: 2,
  retentionSlabs: {
    capped: [18_00_00_000, 14_00_00_000, 11_00_00_000, 18_00_00_000, 14_00_00_000],
    uncapped: 4_00_00_000, // ₹4 Crore
  },
  overseasPayCapEnabled: false,
  overseasPayCapAmount: 18_00_00_000,
  bidIncrementRules: [
    { upToAmount: 1_00_00_000, minIncrement: 5_00_000 },     // Below 1 Cr -> +5 Lakhs
    { upToAmount: 2_00_00_000, minIncrement: 10_00_000 },    // 1 Cr to 2 Cr -> +10 Lakhs
    { upToAmount: 5_00_00_000, minIncrement: 20_00_000 },    // 2 Cr to 5 Cr -> +20 Lakhs
    { upToAmount: 10_00_00_000, minIncrement: 25_00_000 },   // 5 Cr to 10 Cr -> +25 Lakhs
    { upToAmount: Infinity, minIncrement: 50_00_000 },      // Above 10 Cr -> +50 Lakhs
  ],
  timerDurations: {
    biddingSeconds: 15,
    resetOnBidSeconds: 10,
    antiSnipeSeconds: 5,
    rtmDecisionSeconds: 15,
    unsoldCountdownSeconds: 4,
    soldCountdownSeconds: 4,
  },
};

export const MINI_MODE_RULES: ModeRules = {
  ...MEGA_MODE_RULES,
  mode: 'MINI_2026',
  maxPursePerTeam: 125_00_00_000, // ₹125 Crore
  maxTotalRetentionsAndRtm: 0,
  overseasPayCapEnabled: true,
  overseasPayCapAmount: 18_00_00_000, // ₹18 Crore
};

export const IPL_RULES = {
  maxPursePerTeam: 120_00_00_000,
  minSquadSize: 18,
  maxSquadSize: 25,
  maxOverseasPlayers: 8,
  maxRtmPerTeam: 3,
  bidIncrementRules: MEGA_MODE_RULES.bidIncrementRules,
  timerDurations: MEGA_MODE_RULES.timerDurations,
  teamOptions: [
    { id: 'CSK', name: 'Chennai Super Kings', shortName: 'CSK', primaryColor: '#F9CD05', secondaryColor: '#1A2F86', logoUrl: '/logos/csk.svg' },
    { id: 'MI', name: 'Mumbai Indians', shortName: 'MI', primaryColor: '#004BA0', secondaryColor: '#D1AB3E', logoUrl: '/logos/mi.svg' },
    { id: 'RCB', name: 'Royal Challengers Bengaluru', shortName: 'RCB', primaryColor: '#EC1C24', secondaryColor: '#000000', logoUrl: '/logos/rcb.svg' },
    { id: 'KKR', name: 'Kolkata Knight Riders', shortName: 'KKR', primaryColor: '#3A225D', secondaryColor: '#F7D000', logoUrl: '/logos/kkr.svg' },
    { id: 'GT', name: 'Gujarat Titans', shortName: 'GT', primaryColor: '#1B2133', secondaryColor: '#789965', logoUrl: '/logos/gt.svg' },
    { id: 'RR', name: 'Rajasthan Royals', shortName: 'RR', primaryColor: '#EA1A85', secondaryColor: '#004B8D', logoUrl: '/logos/rr.svg' },
    { id: 'SRH', name: 'Sunrisers Hyderabad', shortName: 'SRH', primaryColor: '#FF6400', secondaryColor: '#000000', logoUrl: '/logos/srh.svg' },
    { id: 'LSG', name: 'Lucknow Super Giants', shortName: 'LSG', primaryColor: '#0057B8', secondaryColor: '#E4002B', logoUrl: '/logos/lsg.svg' },
    { id: 'DC', name: 'Delhi Capitals', shortName: 'DC', primaryColor: '#000080', secondaryColor: '#EF4123', logoUrl: '/logos/dc.svg' },
    { id: 'PBKS', name: 'Punjab Kings', shortName: 'PBKS', primaryColor: '#DD1D25', secondaryColor: '#A7A9AC', logoUrl: '/logos/pbks.svg' },
  ] as TeamOption[],
};

export function formatRupees(amount: number): string {
  if (amount === 0) return '₹0';
  if (amount >= 1_00_00_000) {
    const cr = amount / 1_00_00_000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  }
  const lakh = amount / 1_00_000;
  return `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)} Lakh`;
}

export function getNextMinBid(currentBid: number, basePrice: number, rules: ModeRules = MEGA_MODE_RULES): number {
  if (currentBid === 0) {
    return basePrice;
  }
  const matchingRule = rules.bidIncrementRules.find((r) => currentBid < r.upToAmount);
  const increment = matchingRule ? matchingRule.minIncrement : 50_00_000;
  return currentBid + increment;
}
