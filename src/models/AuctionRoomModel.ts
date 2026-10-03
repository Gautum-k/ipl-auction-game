import mongoose, { Document, Schema } from 'mongoose';
import { AuctionRoomState } from '../types';

export interface IAuctionRoomDocument extends Omit<AuctionRoomState, 'roomCode'>, Document {
  roomCode: string;
}

const AuctionRoomSchema = new Schema<IAuctionRoomDocument>(
  {
    roomCode: { type: String, required: true, unique: true, index: true },
    roomName: { type: String, required: true },
    hostSocketId: { type: String, required: true },
    phase: { type: String, required: true },
    currentSetIndex: { type: Number, default: 1 },
    currentPlayerIndex: { type: Number, default: 0 },
    currentPlayer: { type: Schema.Types.Mixed, default: null },
    currentBid: { type: Number, default: 0 },
    highestBidderTeamId: { type: String, default: null },
    rtmClaimedByTeamId: { type: String, default: null },
    rtmAskingBid: { type: Number, default: null },
    bidHistory: { type: Schema.Types.Mixed, default: [] },
    teams: { type: Schema.Types.Mixed, required: true },
    playerPool: { type: Schema.Types.Mixed, required: true },
    soldPlayers: { type: Schema.Types.Mixed, default: [] },
    unsoldPlayers: { type: Schema.Types.Mixed, default: [] },
    acceleratedPool: { type: Schema.Types.Mixed, default: [] },
    isAcceleratedMode: { type: Boolean, default: false },
    timer: {
      secondsLeft: { type: Number, default: 15 },
      isRunning: { type: Boolean, default: false },
      duration: { type: Number, default: 15 },
    },
    createdAt: { type: Number, default: () => Date.now() },
    updatedAt: { type: Number, default: () => Date.now() },
  },
  {
    timestamps: false,
    minimize: false,
  }
);

export const AuctionRoomModel =
  mongoose.models.AuctionRoom || mongoose.model<IAuctionRoomDocument>('AuctionRoom', AuctionRoomSchema);
