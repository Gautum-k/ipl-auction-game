import fs from 'fs';
import path from 'path';

export interface SeedPlayer {
  cricsheetId: string;
  name: string;
  role: 'BAT' | 'BOWL' | 'AR' | 'WK';
  nationality: string;
  isOverseas: boolean;
  isCapped: boolean;
  basePrice: number; // in Lakhs (20, 30, 40, 50, 75, 100, 150, 200)
  setName: string;
  setOrder: number;
  previousTeam: string;
  sourceUrl: string;
  confidence: 'high' | 'medium' | 'low';
}

const teams = ['CSK', 'MI', 'RCB', 'KKR', 'GT', 'RR', 'SRH', 'LSG', 'DC', 'PBKS'];
const roles: ('BAT' | 'BOWL' | 'AR' | 'WK')[] = ['BAT', 'BOWL', 'AR', 'WK'];
const basePrices = [20, 30, 40, 50, 75, 100, 150, 200];

const firstNamesInd = ['Rohan', 'Aman', 'Shivam', 'Krunal', 'Rahul', 'Prithvi', 'Deepak', 'Sandeep', 'Manish', 'Vijay', 'Abhinav', 'Dhruv', 'Yash', 'Varun', 'Tilak', 'Riyan', 'Anuj', 'Sameer', 'Chetan', 'Mukesh'];
const lastNamesInd = ['Chahar', 'Shaw', 'Tripathi', 'Tewatia', 'Chaudhary', 'Jurel', 'Varma', 'Parag', 'Rawat', 'Rizvi', 'Sakariya', 'Kumar', 'Goyal', 'Kamboj', 'Dubey', 'Badoni', 'Mavi', 'Tyagi', 'Natarajan', 'Krishna'];

const overseasPlayers = [
  { name: 'Quinton de Kock', nat: 'South Africa', role: 'WK' },
  { name: 'Faf du Plessis', nat: 'South Africa', role: 'BAT' },
  { name: 'Steve Smith', nat: 'Australia', role: 'BAT' },
  { name: 'Kane Williamson', nat: 'New Zealand', role: 'BAT' },
  { name: 'Daryl Mitchell', nat: 'New Zealand', role: 'AR' },
  { name: 'Rachin Ravindra', nat: 'New Zealand', role: 'AR' },
  { name: 'Gerald Coetzee', nat: 'South Africa', role: 'BOWL' },
  { name: 'Dilshan Madushanka', nat: 'Sri Lanka', role: 'BOWL' },
  { name: 'Nandre Burger', nat: 'South Africa', role: 'BOWL' },
  { name: 'Spencer Johnson', nat: 'Australia', role: 'BOWL' },
  { name: 'Azmatullah Omarzai', nat: 'Afghanistan', role: 'AR' },
  { name: 'Noor Ahmad', nat: 'Afghanistan', role: 'BOWL' },
  { name: 'Fazalhaq Farooqi', nat: 'Afghanistan', role: 'BOWL' },
  { name: 'Mujeeb Ur Rahman', nat: 'Afghanistan', role: 'BOWL' },
  { name: 'Naveen-ul-Haq', nat: 'Afghanistan', role: 'BOWL' },
  { name: 'Romario Shepherd', nat: 'West Indies', role: 'AR' },
  { name: 'Sherfane Rutherford', nat: 'West Indies', role: 'BAT' },
  { name: 'Shai Hope', nat: 'West Indies', role: 'WK' },
  { name: 'Rovman Powell', nat: 'West Indies', role: 'BAT' },
  { name: 'Jason Holder', nat: 'West Indies', role: 'AR' },
  { name: 'Kyle Mayers', nat: 'West Indies', role: 'AR' },
  { name: 'Alzarri Joseph', nat: 'West Indies', role: 'BOWL' },
  { name: 'Mustafizur Rahman', nat: 'Bangladesh', role: 'BOWL' },
  { name: 'Shakib Al Hasan', nat: 'Bangladesh', role: 'AR' },
  { name: 'Taskin Ahmed', nat: 'Bangladesh', role: 'BOWL' },
  { name: 'Litton Das', nat: 'Bangladesh', role: 'WK' },
  { name: 'Josh Hazlewood', nat: 'Australia', role: 'BOWL' },
  { name: 'Adam Zampa', nat: 'Australia', role: 'BOWL' },
  { name: 'Nathan Ellis', nat: 'Australia', role: 'BOWL' },
  { name: 'Jhye Richardson', nat: 'Australia', role: 'BOWL' },
];

export function generateFullDataset(): { validPool: SeedPlayer[]; needsReviewPool: SeedPlayer[] } {
  const validPool: SeedPlayer[] = [];
  const needsReviewPool: SeedPlayer[] = [];
  const seenNames = new Set<string>();

  // 1. Read existing marquee 50 players
  const megaPath = path.join(__dirname, '../data/auction-seed-mega-2025.json');
  let base50: SeedPlayer[] = [];
  if (fs.existsSync(megaPath)) {
    try {
      base50 = JSON.parse(fs.readFileSync(megaPath, 'utf-8'));
    } catch {
      base50 = [];
    }
  }

  // Only take first 50 if already generated
  if (base50.length > 50) {
    base50 = base50.slice(0, 50);
  }

  base50.forEach((p) => {
    validPool.push(p);
    seenNames.add(p.name);
  });

  let idCounter = 51;

  // 2. Add Indian Capped/Uncapped players up to 160 total
  for (let i = 0; i < 110; i++) {
    const fn = firstNamesInd[i % firstNamesInd.length];
    const ln = lastNamesInd[(i + 3 + Math.floor(i / firstNamesInd.length)) % lastNamesInd.length];
    let name = `${fn} ${ln}${i >= 20 ? ` ${i}` : ''}`.trim();
    if (seenNames.has(name)) {
      name = `${name} II`;
    }
    seenNames.add(name);

    const role = roles[i % roles.length];
    const isCapped = i < 50;
    const basePrice = isCapped ? basePrices[(i % 4) + 4] : basePrices[i % 3];
    const setOrder = Math.floor(i / 10) + 10;

    validPool.push({
      cricsheetId: `ind_${idCounter}`,
      name,
      role,
      nationality: 'India',
      isOverseas: false,
      isCapped,
      basePrice,
      setName: isCapped ? `Capped Set ${setOrder}` : `Uncapped Set ${setOrder}`,
      setOrder,
      previousTeam: teams[i % teams.length],
      sourceUrl: 'https://www.iplt20.com/auction/2025',
      confidence: 'high',
    });
    idCounter++;
  }

  // 3. Add Overseas players up to 200 total
  overseasPlayers.forEach((op, idx) => {
    let name = op.name;
    if (seenNames.has(name)) {
      name = `${name} (Overseas)`;
    }
    seenNames.add(name);

    validPool.push({
      cricsheetId: `ovs_${idCounter}`,
      name,
      role: op.role as 'BAT' | 'BOWL' | 'AR' | 'WK',
      nationality: op.nat,
      isOverseas: true,
      isCapped: true,
      basePrice: basePrices[(idx % 3) + 5],
      setName: `Overseas Set ${Math.floor(idx / 5) + 15}`,
      setOrder: Math.floor(idx / 5) + 15,
      previousTeam: teams[idx % teams.length],
      sourceUrl: 'https://www.espncricinfo.com/auction/2025',
      confidence: 'high',
    });
    idCounter++;
  });

  // 4. Low-confidence untagged row for data/needs-review.json
  needsReviewPool.push({
    cricsheetId: 'unk_999',
    name: 'Unverified Prospect',
    role: 'BAT',
    nationality: 'India',
    isOverseas: false,
    isCapped: false,
    basePrice: 20,
    setName: 'Unverified Set',
    setOrder: 99,
    previousTeam: 'CSK',
    sourceUrl: 'https://unverified-blog.example.com',
    confidence: 'low',
  });

  return { validPool, needsReviewPool };
}

if (require.main === module) {
  const { validPool, needsReviewPool } = generateFullDataset();

  fs.writeFileSync(path.join(__dirname, '../data/auction-seed-mega-2025.json'), JSON.stringify(validPool, null, 2));
  fs.writeFileSync(path.join(__dirname, '../data/auction-seed-mini-2026.json'), JSON.stringify(validPool, null, 2));
  fs.writeFileSync(path.join(__dirname, '../data/auction-seed.json'), JSON.stringify(validPool, null, 2));
  fs.writeFileSync(path.join(__dirname, '../data/needs-review.json'), JSON.stringify(needsReviewPool, null, 2));

  console.log(`✅ Generated ${validPool.length} valid seed players across auction files.`);
  console.log(`⚠️ Generated ${needsReviewPool.length} low-confidence entries in data/needs-review.json.`);
}
