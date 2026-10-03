import fs from 'fs';
import path from 'path';

export interface SeedPlayer {
  cricsheetId: string;
  name: string;
  role: 'BAT' | 'BOWL' | 'AR' | 'WK';
  nationality: string;
  isOverseas: boolean;
  isCapped: boolean;
  basePrice: number;
  setName: string;
  setOrder: number;
  previousTeam?: string;
  sourceUrl?: string;
  confidence?: 'high' | 'medium' | 'low';
}

const validRoles = ['BAT', 'BOWL', 'AR', 'WK'];
const validBasePricesLakhs = [20, 30, 40, 50, 75, 100, 150, 200];

export function validatePlayerPool(seedPath: string): { valid: boolean; errors: string[]; stats: Record<string, number> } {
  const errors: string[] = [];
  const fullPath = path.resolve(seedPath);

  if (!fs.existsSync(fullPath)) {
    return { valid: false, errors: [`Seed file not found: ${seedPath}`], stats: {} };
  }

  const rawData = fs.readFileSync(fullPath, 'utf-8');
  const players: SeedPlayer[] = JSON.parse(rawData);

  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  let indianCount = 0;
  let overseasCount = 0;
  let batCount = 0;
  let bowlCount = 0;
  let arCount = 0;
  let wkCount = 0;

  const basePriceCounts: Record<number, number> = {};
  let lastSetOrder = 0;

  players.forEach((p, idx) => {
    // 1. Duplicate ID check
    if (!p.cricsheetId) {
      errors.push(`Row ${idx + 1}: Missing cricsheetId for player "${p.name}"`);
    } else if (seenIds.has(p.cricsheetId)) {
      errors.push(`Row ${idx + 1}: Duplicate cricsheetId "${p.cricsheetId}" found`);
    } else {
      seenIds.add(p.cricsheetId);
    }

    // Duplicate Name check
    if (seenNames.has(p.name)) {
      errors.push(`Row ${idx + 1}: Duplicate player name "${p.name}" found`);
    } else {
      seenNames.add(p.name);
    }

    // 2. Missing Role check
    if (!p.role || !validRoles.includes(p.role)) {
      errors.push(`Row ${idx + 1}: Missing or invalid role "${p.role}" for player "${p.name}"`);
    } else {
      if (p.role === 'BAT') batCount++;
      else if (p.role === 'BOWL') bowlCount++;
      else if (p.role === 'AR') arCount++;
      else if (p.role === 'WK') wkCount++;
    }

    // 3. Missing Nationality check
    if (!p.nationality || p.nationality.trim() === '') {
      errors.push(`Row ${idx + 1}: Missing nationality for player "${p.name}"`);
    }

    // 4. Invalid Base Price check
    if (typeof p.basePrice !== 'number' || !validBasePricesLakhs.includes(p.basePrice)) {
      errors.push(`Row ${idx + 1}: Invalid basePrice ${p.basePrice} for player "${p.name}" (must be one of 20, 30, 40, 50, 75, 100, 150, 200 Lakhs)`);
    } else {
      basePriceCounts[p.basePrice] = (basePriceCounts[p.basePrice] || 0) + 1;
    }

    // 5. Set Order Sequence check (must be non-decreasing and within range 1-16)
    if (!p.setName || typeof p.setOrder !== 'number') {
      errors.push(`Row ${idx + 1}: Missing set information (setName/setOrder) for player "${p.name}"`);
    } else {
      if (p.setOrder < 1 || p.setOrder > 16) {
        errors.push(`Row ${idx + 1}: Invalid setOrder ${p.setOrder} for player "${p.name}" (must be 1-16)`);
      }
      if (p.setOrder < lastSetOrder) {
        errors.push(`Row ${idx + 1}: Out-of-sequence setOrder (${p.setOrder} < previous ${lastSetOrder}) for player "${p.name}"`);
      }
      lastSetOrder = p.setOrder;
    }

    if (p.isOverseas) {
      overseasCount++;
    } else {
      indianCount++;
    }
  });

  // 6. Pool size check (Phase 12 requirement: target 350-400+ total players)
  if (players.length < 300) {
    errors.push(`Pool size ${players.length} is too small for expanded Mini/Mega pool (must be >= 300 players)`);
  }

  const valid = errors.length === 0;

  return {
    valid,
    errors,
    stats: {
      total: players.length,
      indian: indianCount,
      overseas: overseasCount,
      batters: batCount,
      bowlers: bowlCount,
      allRounders: arCount,
      wicketkeepers: wkCount,
      ...basePriceCounts,
    },
  };
}

if (require.main === module) {
  console.log('🔍 Validating IPL Player Seed Datasets...');

  const seedsToValidate = [
    'data/auction-seed-mega-2025.json',
    'data/auction-seed-mini-2026.json',
    'data/auction-seed.json',
  ];

  let hasFailures = false;

  seedsToValidate.forEach((seedFile) => {
    console.log(`\n📄 Checking ${seedFile}...`);
    const res = validatePlayerPool(seedFile);
    if (!res.valid) {
      console.error(`❌ Validation FAILED for ${seedFile}:`);
      res.errors.forEach((err) => console.error(`  - ${err}`));
      hasFailures = true;
    } else {
      console.log(`✅ ${seedFile} PASSED validation!`);
      console.log(`   Total: ${res.stats.total} | Indian: ${res.stats.indian} | Overseas: ${res.stats.overseas}`);
      console.log(`   Roles -> BAT: ${res.stats.batters} | BOWL: ${res.stats.bowlers} | AR: ${res.stats.allRounders} | WK: ${res.stats.wicketkeepers}`);
    }
  });

  if (hasFailures) {
    console.error('\n💥 Player validation failed! Exiting with code 1.');
    process.exit(1);
  } else {
    console.log('\n🎉 All player seed files passed strict validation checks.');
    process.exit(0);
  }
}
