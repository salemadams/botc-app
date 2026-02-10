# Blood on the Clocktower App - Implementation Plan

## Project Vision

A **Storyteller Assistant** for in-person Blood on the Clocktower games. Each player uses their own device to view their role and receive private messages. The Storyteller (host) has a dashboard to track game state, guide night phases, and communicate with players - while maintaining full manual control over the game.

**This is NOT a game engine.** It doesn't enforce rules or automate gameplay. It makes the Storyteller's job easier.

---

## Current State

### Already Working
- Player joins room with their device
- Players see their assigned role
- Storyteller can start game and assign roles
- Real-time Socket.io communication
- Role data with night order and ability text
- Basic wake notification (haptic)

### Not Yet Implemented
- Storyteller dashboard with player overview
- Player state tracking (alive/dead)
- Reminder token system
- Night order guide with prompts
- Private messaging (Storyteller → Player)
- Phase indication (Night/Day)
- Flexible state management (undo, reset)

---

## Implementation Phases

### Phase 1: Player State & Storyteller Overview
**Goal:** Storyteller sees all players and can track alive/dead status

| Task | Description |
|------|-------------|
| 1.1 Add player state fields | `isAlive`, `reminders[]` to Player model |
| 1.2 Storyteller player list | Show all players with roles (host view only) |
| 1.3 Toggle alive/dead | Tap to mark player dead, tap again to undo |
| 1.4 Player death indicator | Dead players see "You are dead" on their view |
| 1.5 Sync state changes | Broadcast player state updates to all clients |

### Phase 2: Reminder Token System
**Goal:** Storyteller can place reminder tokens on players

| Task | Description |
|------|-------------|
| 2.1 Reminder data model | Array of active reminders per player |
| 2.2 Add reminder UI | Storyteller taps player → sees available reminders for all roles |
| 2.3 Remove reminder UI | Tap existing reminder to remove |
| 2.4 Visual indicators | Show reminder badges on player cards (host only) |
| 2.5 Common reminders | Include generic reminders: "Dead", "Used ability", "Poisoned", "Protected" |

### Phase 3: Night Order Guide
**Goal:** Storyteller has guided night phase with ordered player list

| Task | Description |
|------|-------------|
| 3.1 Night order calculation | Sort alive players by role's firstNight/otherNight values |
| 3.2 Night order screen | Scrollable list showing wake order |
| 3.3 Ability prompts | Show what to do for each role (simplified for messaging) |
| 3.4 First night toggle | Switch between first night and other nights order |
| 3.5 Mark complete | Check off each role as handled, visual progress |

### Phase 4: Private Messaging
**Goal:** Storyteller can send private messages to players during night

| Task | Description |
|------|-------------|
| 4.1 Message events | `SendPrivateMessage`, `ReceivePrivateMessage` socket events |
| 4.2 Storyteller send UI | Quick message input when viewing a player |
| 4.3 Player receive UI | Modal/notification showing message from Storyteller |
| 4.4 Message templates | Pre-built messages for common info (e.g., "You see 2 evil players") |
| 4.5 Message history | Storyteller can see what they sent to each player |

### Phase 5: Phase Indication
**Goal:** Players know if it's Night or Day

| Task | Description |
|------|-------------|
| 5.1 Game phase state | `currentPhase: 'night' | 'day'`, `nightNumber` |
| 5.2 Phase toggle | Storyteller button to switch phases |
| 5.3 Player phase display | Players see "Night 1" or "Day 2" on their screen |
| 5.4 Night screen dimming | Optional: dim player screen during night for immersion |

### Phase 6: Polish & Resume-Readiness
**Goal:** Professional quality for portfolio

| Task | Description |
|------|-------------|
| 6.1 Error handling | Connection errors, room not found, graceful failures |
| 6.2 Reconnection | Player rejoins room after disconnect |
| 6.3 Loading states | Proper loading indicators throughout |
| 6.4 README | Project overview, screenshots, setup instructions |
| 6.5 Code cleanup | Remove dev hacks, add comments where needed |
| 6.6 Basic tests | Unit tests for role distribution, night order sorting |

---

## Scope Boundaries

### In Scope
- Trouble Brewing script (22 roles)
- Multi-device: each player on their own phone
- Storyteller dashboard with full control
- Private messaging for night information
- Flexible state management (undo anything)
- Night order guide with prompts

### Out of Scope (Future Maybe)
- Additional scripts
- Session persistence (survive app close)
- Voting tracker (in-person voting works fine)
- Automated anything - storyteller decides all
- Traveler roles
- Fabled characters

---

## Priority Order

```
Phase 1 (Player State)    → Core tracking capability
Phase 2 (Reminders)       → Essential storyteller tool
Phase 3 (Night Guide)     → Main value proposition
Phase 4 (Messaging)       → Replaces physical token showing
Phase 5 (Phases)          → Nice immersion feature
Phase 6 (Polish)          → Resume-ready quality
```

---

## Key User Flows

### Player Flow
1. Enter name → Join room with code
2. Wait in lobby → See assigned role when game starts
3. During game: See role, alive/dead status, current phase
4. During night: Receive wake notification, see private messages from Storyteller
5. During day: Discuss in person (app is passive)

### Storyteller Flow
1. Create room → Select script → Wait for players
2. Start game → Roles auto-assigned
3. **Night phase:**
   - Tap "Start Night" → Players see night screen
   - View night order list
   - For each role: wake player (notification), send message with info, mark done
   - Tap "Start Day"
4. **Day phase:**
   - Players discuss in person
   - If execution: toggle player to dead
   - Add reminder tokens as needed
   - Tap "Start Night" when ready
5. Repeat until game ends (storyteller declares winner)

---

## Technical Notes

### New Socket Events Needed
```
Server → Client:
- PlayerStateChanged { playerId, isAlive, reminders }
- PhaseChanged { phase, nightNumber }
- PrivateMessage { from: 'storyteller', content }
- WakeNotification { }

Client → Server:
- UpdatePlayerState { playerId, isAlive?, reminders? }
- ChangePhase { phase }
- SendPrivateMessage { toPlayerId, content }
- WakePlayer { playerId }
```

### Data Model Additions
```typescript
// Add to Player
interface Player {
  // existing...
  isAlive: boolean;
  reminders: Reminder[];
}

interface Reminder {
  id: string;
  text: string;
  fromRole?: string; // which role placed it
}

// Add to GameRoom
interface GameRoom {
  // existing...
  currentPhase: 'lobby' | 'night' | 'day' | 'ended';
  nightNumber: number;
}
```

### Key Files to Modify
- `shared/game.ts` - Add new fields to interfaces
- `server/src/services/GameService.ts` - New event handlers
- `client/src/app/game/session.tsx` - Split into player/host views
- New: `client/src/app/game/night-order.tsx` - Night guide screen
- New: `client/src/components/PlayerCard.tsx` - Reusable player display

---

## Quick Wins to Start

1. **Add `isAlive` to Player** - Unblocks all state tracking
2. **Storyteller sees all roles** - High value, simple change
3. **Toggle alive/dead** - Immediately useful in real games
4. **Night order display** - Shows the core feature vision
