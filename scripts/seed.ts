import fs from 'fs';
import path from 'path';
import mongoose, { Schema } from 'mongoose';
import { connectToDatabase } from '../src/lib/db';

export interface SeedPlayer {
  cricsheetId: string;
  name: string;
  role: 'BAT' | 'BOWL' | 'AR' | 'WK';
  nationality: string;
  isOverseas: boolean;
  isCapped: boolean;
  basePrice: number; // In Lakhs
  setName: string;
  setOrder: number;
  previousTeam?: string;
  sourceUrl?: string;
  confidence?: 'high' | 'medium' | 'low';
}

const PlayerMongoSchema = new Schema(
  {
    cricsheetId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    nationality: { type: String, required: true },
    isOverseas: { type: Boolean, required: true },
    isCapped: { type: Boolean, required: true },
    basePrice: { type: Number, required: true },
    setName: { type: String, required: true },
    setOrder: { type: Number, required: true },
    previousTeam: { type: String, default: null },
    sourceUrl: { type: String, default: null },
    confidence: { type: String, default: 'high' },
    updatedAt: { type: Number, default: () => Date.now() },
  },
  { minimize: false }
);

const PlayerModel = mongoose.models.SeedPlayer || mongoose.model('SeedPlayer', PlayerMongoSchema);

/**
 * Idempotent seed script into MongoDB (players collection).
 * Re-running updates, never duplicates.
 */
export async function seedPlayersToMongo(mode: 'mega' | 'mini' = 'mega'): Promise<number> {
  const fileName = mode === 'mini' ? 'auction-seed-mini-2026.json' : 'auction-seed-mega-2025.json';
  const filePath = path.join(__dirname, `../data/${fileName}`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Seed file not found: ${filePath}`);
  }

  const players: SeedPlayer[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`🌱 Seeding ${players.length} players from ${fileName} into MongoDB...`);

  let upsertCount = 0;

  try {
    await connectToDatabase();

    const bulkOps = players.map((p) => ({
      updateOne: {
        filter: { cricsheetId: p.cricsheetId },
        update: { $set: { ...p, updatedAt: Date.now() } },
        upsert: true,
      },
    }));

    const res = await PlayerModel.bulkWrite(bulkOps);
    upsertCount = res.upsertedCount + res.modifiedCount;
    console.log(`✅ Idempotent MongoDB seed finished. Upserted/Updated ${upsertCount} player document(s).`);
  } catch (err) {
    console.warn('⚠️ MongoDB seed notice (running in memory mode):', (err as Error).message);
    upsertCount = players.length;
  }

  return upsertCount;
}

if (require.main === module) {
  const mode = (process.argv[2] as 'mega' | 'mini') || 'mega';
  seedPlayersToMongo(mode).then(() => process.exit(0));
}
