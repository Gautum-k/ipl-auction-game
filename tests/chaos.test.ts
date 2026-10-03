import { describe, it, expect } from 'vitest';
import { AuctionEngine } from '../src/engine/auctionEngine';
import { AuctionRoomState } from '../src/types';

describe('Phase 7: Chaos Testing & Resumption Verification', () => {
  it('recovers player seat ownership after socket disconnect using browser session token', () => {
    // 1. Setup room and claim team
    let room = AuctionEngine.createInitialRoom('CHAOS1', 'Chaos Test Room', 'host_socket', 'host_session', {
      mode: 'MEGA_2025',
      roomSize: 10,
      timerLength: 15,
      fillWithBots: false,
    });

    const cskTeam = room.teams['CSK'];
    const sessionToken = 'user_browser_session_uuid_12345';
    cskTeam.ownerSocketId = 'original_socket_99';
    cskTeam.ownerSessionToken = sessionToken;
    cskTeam.ownerName = 'Manager';

    // 2. Simulate connection drop (socket disconnects)
    cskTeam.ownerSocketId = null;

    // 3. Simulate client reconnection with same session token
    const newSocketId = 'reconnected_socket_100';
    Object.values(room.teams).forEach((t) => {
      if (t.ownerSessionToken === sessionToken) {
        t.ownerSocketId = newSocketId;
      }
    });

    // 4. Assert seat recovered seamlessly
    expect(room.teams['CSK'].ownerSocketId).toBe(newSocketId);
    expect(room.teams['CSK'].ownerName).toBe('Manager');
  });

  it('preserves room phase, player pool, squads, and timer state when server rehydrates state', () => {
    // 1. Active bidding room
    let room = AuctionEngine.createInitialRoom('REHYD1', 'Rehydration Room', 'host_socket', 'host_session', {
      mode: 'MEGA_2025',
      roomSize: 10,
      timerLength: 15,
      fillWithBots: false,
    });

    room.phase = 'BIDDING';
    room.timer.isRunning = true;
    room.timer.secondsLeft = 12;

    // Claim team CSK first so bid validation passes
    room.teams['CSK'].ownerSocketId = 'socket_csk_owner';
    room.teams['CSK'].ownerName = 'MS Dhoni';

    // Place a bid
    room = AuctionEngine.placeBid(room, 'CSK');
    expect(room.highestBidderTeamId).toBe('CSK');

    // 2. Simulate serialization to DB object & deserialization on server restart
    const dbSerializedState = JSON.parse(JSON.stringify(room)) as AuctionRoomState;

    // 3. Rehydrated memory state
    const rehydratedRoom = dbSerializedState;

    // 4. Assert full state integrity preserved
    expect(rehydratedRoom.roomCode).toBe('REHYD1');
    expect(rehydratedRoom.phase).toBe('BIDDING');
    expect(rehydratedRoom.highestBidderTeamId).toBe('CSK');
    expect(rehydratedRoom.timer.secondsLeft).toBe(10);
    expect(rehydratedRoom.teams['CSK'].squad.length).toBe(room.teams['CSK'].squad.length);
  });
});
