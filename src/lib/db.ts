import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ipl_auction';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then(async (m) => {
      console.log('✅ Connected to MongoDB Atlas/Database');
      try {
        const AuctionRoom = m.models.AuctionRoom || m.model('AuctionRoom');
        await AuctionRoom.createIndexes();
      } catch (err) {
        console.warn('⚠️ MongoDB index creation warning:', (err as Error).message);
      }
      return m;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    console.warn('⚠️ MongoDB connection deferred or unavailable:', (e as Error).message);
    throw e;
  }

  return cached!.conn;
}
