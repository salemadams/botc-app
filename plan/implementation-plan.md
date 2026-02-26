# Blood on the Clocktower App — Resume-Ready Roadmap

## Project Vision

A **Storyteller Assistant** for in-person Blood on the Clocktower games. Each player uses their own device to view their role and receive private messages. The Storyteller (host) has a dashboard to track game state, guide night phases, and communicate with players — while maintaining full manual control over the game.

**This is NOT a game engine.** It doesn't enforce rules or automate gameplay. It makes the Storyteller's job easier.

---

## Current State (Updated Feb 2026)

### Completed
- Room creation/joining with 4-digit codes
- Real-time Socket.io communication (14 event types)
- Role assignment from Trouble Brewing script (22 roles)
- Storyteller player list with role visibility
- Player alive/dead toggle with sync
- Wake notification (haptic vibration)
- Private messaging (Storyteller ↔ Player) with history
- Night order guide modal (sorted by priority, with reminders)
- Day counter (increment/decrement)
- Timer with host controls, modal picker, and cross-player sync
- Role card display for players

### Not Yet Implemented
- Night/Day phase toggle and visual distinction
- Night order check-off (mark roles as handled)
- Reminder token system
- Reconnection handling
- Error handling and loading states
- Database persistence
- Testing
- Deployment
- Style overhaul

---

## Implementation Phases

### Phase 0: State Management Refactor
**Goal:** Replace React Context with Zustand before adding more features. Eliminates unnecessary re-renders via per-field selectors and removes Provider boilerplate.

| # | Task | Description |
|---|------|-------------|
| 0.1 | Migrate GameContext to Zustand | Install `zustand`, create `stores/useGameStore.ts` with all game state and actions, extract socket subscriptions to a standalone `subscribeToGameEvents` function, update all 14 consumers to use `useGameStore((s) => s.field)` selectors, delete `useGameContext.tsx`. |

---

### Phase 1: Complete Core Features
**Goal:** Finish the features that make the app functionally complete for a real game.

| # | Task | Description |
|---|------|-------------|
| 1.1 | Night/Day phase toggle | Add `currentPhase: 'night' \| 'day'` to GameRoom. Storyteller button to switch phases, broadcast to all players via new `ChangePhase` / `PhaseChanged` socket events. |
| 1.2 | Player phase display | Players see "Night 1" / "Day 2" header. Visual distinction between phases (darker background at night). |
| 1.3 | Night order check-off | Storyteller can mark each role as handled during night phase. Visual progress indicator. Check-off state resets when a new night begins. |
| 1.4 | Reminder token system | Add `reminders: Reminder[]` to Player model. Storyteller taps player → sees available reminders from all in-play roles plus generic reminders (Poisoned, Protected, Dead vote, Used ability). Tap to add, tap to remove. |
| 1.5 | Reminder badges | Show reminder icons/badges on player cards in the host's player list. Compact visual — don't clutter the UI. |

**New Types:**
```typescript
interface Reminder {
  id: string;
  text: string;
  fromRole?: string;
}

// GameRoom additions
currentPhase: 'night' | 'day';
```

**New Socket Events:**
```
Client → Server: ChangePhase, AddReminder, RemoveReminder
Server → Client: PhaseChanged, ReminderAdded, ReminderRemoved
```

---

### Phase 2: Resilience & Error Handling
**Goal:** Survive real-world usage. This is what separates hobby projects from portfolio pieces.

| # | Task | Description |
|---|------|-------------|
| 2.1 | Reconnection handling | Player rejoins room after disconnect or app background. Use a session token stored in AsyncStorage. On reconnect, server restores player to their room. |
| 2.2 | Connection error UI | Show "Connecting...", "Disconnected — retrying", and "Reconnected" states. Non-blocking toast or banner. |
| 2.3 | Room not found handling | Graceful error when joining an invalid or expired room code. Navigate back to join screen with error message. |
| 2.4 | Server-side validation | Validate all socket events on the server: Is the player in this room? Is the player the host? Is the game in the right phase? Return error events for invalid requests. |
| 2.5 | Loading states | Proper skeleton/spinner states for room creation, game start, and reconnection. Replace the current `...Loading` text. |
| 2.6 | Host disconnect handling | If the Storyteller disconnects, show "Storyteller disconnected" to players. If they reconnect within a timeout, restore. Otherwise, end the game gracefully. |

---

### Phase 3: Database Persistence
**Goal:** Replace in-memory storage with a real database. Shows full-stack ability and makes the app usable beyond a single server session.

| # | Task | Description |
|---|------|-------------|
| 3.1 | Add database | Set up SQLite (better-sqlite3) or PostgreSQL (Prisma). Design schema for rooms, players, messages, and game state. |
| 3.2 | Persist game rooms | Room state written to DB on every mutation. Server restart recovers active rooms. |
| 3.3 | Session tokens | Generate a unique token per player on join. Store in AsyncStorage on client. Used for reconnection (Phase 2.1). |
| 3.4 | Room expiry & cleanup | Auto-delete rooms after 6 hours of inactivity. Background job or lazy cleanup on access. |

**Schema (conceptual):**
```
rooms: id, code, phase, script_id, day, timer, created_at, last_active
players: id, room_id, socket_id, session_token, name, role_id, is_host, is_alive
reminders: id, player_id, text, from_role
messages: id, room_id, from_player_id, to_player_id, content, created_at
```

---

### Phase 4: Testing
**Goal:** Demonstrate engineering discipline. Targeted tests on critical logic — not 100% coverage.

| # | Task | Description |
|---|------|-------------|
| 4.1 | Unit: LobbyValidation | Test role distribution logic — correct team counts for various player counts, edge cases with setup-affecting roles (Drunk, Baron). |
| 4.2 | Unit: Night order sorting | Verify correct wake order for first night and other nights. Test filtering of dead players and roles with order value 0. |
| 4.3 | Integration: GameService | Test room lifecycle (create → join → start → play → end). Test socket event validation. Mock Socket.io connections. |
| 4.4 | Component: Key UI | Test PlayerList renders correct alive/dead states. Test RoleCard displays correct info. Test timer display formats correctly. |

**Setup:** Vitest for unit/integration, React Native Testing Library for components.

---

### Phase 5: Deployment & DevOps
**Goal:** A live demo link. Worth 100x more than "clone and run locally."

| # | Task | Description |
|---|------|-------------|
| 5.1 | Deploy server | Railway, Render, or Fly.io (free tier). WebSocket support required. Set production env vars. |
| 5.2 | Deploy client (web) | Expo web build → Vercel or Netlify. Point API URL to deployed server. |
| 5.3 | Environment config | Separate dev/prod env files. CORS whitelist for production client URL. |
| 5.4 | CI pipeline | GitHub Actions: lint + typecheck + test on PR. Prevents regressions. |

---

### Phase 6: Style Overhaul
**Goal:** Make it visually impressive. First impressions matter for resumes.

| # | Task | Description |
|---|------|-------------|
| 6.1 | Design system | Dark theme with gothic/BotC aesthetic. Consistent color palette, typography, spacing. Define team colors (Townsfolk blue, Outsider teal, Minion red, Demon purple). |
| 6.2 | Role cards | Styled cards with team color accents, ability text, and role iconography. The visual centerpiece of the app. |
| 6.3 | Night mode visuals | Darker, moodier UI during night phase. Subtle transition when phase changes. |
| 6.4 | Animations | Smooth transitions for phase changes, player death, modal open/close. Use React Native Reanimated or LayoutAnimation. |
| 6.5 | Responsive layout | Test and fix layout across phone sizes (small iPhone SE → large Android) and web browser widths. |

---

### Phase 7: README & Presentation
**Goal:** The first thing recruiters see. Make it count.

| # | Task | Description |
|---|------|-------------|
| 7.1 | README | Project overview, tech stack badges, architecture diagram (client ↔ server ↔ DB with Socket.io), setup instructions. |
| 7.2 | Screenshots / GIF demo | Capture both Storyteller and Player views. Show a night phase flow. Use a screen recording → GIF tool. |
| 7.3 | Live demo link | Prominent at top of README. "Try it now" with instructions for testing solo (two browser tabs). |
| 7.4 | Code cleanup | Remove dev-mode test player generation, unused imports, console.logs. Add brief comments only where logic is non-obvious. |

---

## Priority Order

```
Phase 1 (Core Features)     → Functionally complete app
Phase 2 (Resilience)        → Survives real usage
Phase 6 (Style Overhaul)    → Visually impressive
Phase 3 (Database)          → Full-stack credibility
Phase 5 (Deployment)        → Live demo link
Phase 4 (Testing)           → Engineering discipline
Phase 7 (README)            → Final presentation layer
```

> Style is prioritized above Database because visual impact matters more in the ~30 seconds a recruiter spends on a project. If targeting backend-heavy roles, swap Phases 3 and 6.

---

## Scope Boundaries

### In Scope
- Trouble Brewing script (22 roles)
- Multi-device: each player on their own phone/browser
- Storyteller dashboard with full manual control
- Private messaging for night information
- Night order guide with check-off
- Reminder token system
- Night/Day phase distinction
- Database persistence
- Reconnection handling
- Deployment (web + server)
- Targeted test suite

### Out of Scope
- Additional scripts (Sects & Violets, Bad Moon Rising)
- Voting tracker (in-person voting works fine)
- Automated game logic — storyteller decides everything
- Traveler roles
- Fabled characters
- Native app store deployment (web is sufficient for portfolio)

---

## Key User Flows

### Player Flow
1. Enter name → Join room with code
2. Wait in lobby → See assigned role when game starts
3. During night: Screen dims, receive wake notification, see private messages from Storyteller
4. During day: See "Day 2" header, discuss in person (app is passive), view role for reference
5. If killed: See dead indicator on their view

### Storyteller Flow
1. Create room → Wait for players to join
2. Start game → Roles auto-assigned
3. **Night phase:**
   - Tap "Start Night" → All players see night screen
   - View night order list
   - For each role: tap to wake (haptic), send message with info, check off
   - Review/add reminder tokens as needed
   - Tap "Start Day"
4. **Day phase:**
   - Players discuss in person
   - Start timer for nominations if needed
   - If execution: toggle player to dead
   - Add/remove reminder tokens
   - Tap "Start Night" when ready
5. Repeat until game ends (storyteller declares winner manually)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   Client (Expo)                  │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Expo      │  │ React    │  │ NativeWind   │  │
│  │ Router    │  │ Context  │  │ (Tailwind)   │  │
│  └─────┬─────┘  └────┬─────┘  └──────────────┘  │
│        │              │                           │
│  ┌─────┴──────────────┴─────┐                    │
│  │   Socket.io Client       │                    │
│  └─────────────┬────────────┘                    │
└────────────────┼────────────────────────────────┘
                 │ WebSocket
┌────────────────┼────────────────────────────────┐
│  ┌─────────────┴────────────┐    Server (Node)  │
│  │   Socket.io Server       │                    │
│  └─────────────┬────────────┘                    │
│  ┌─────────────┴────────────┐                    │
│  │   GameService            │                    │
│  │   RoleService            │                    │
│  │   ScriptService          │                    │
│  └─────────────┬────────────┘                    │
│  ┌─────────────┴────────────┐                    │
│  │   Database (Phase 3)     │                    │
│  └──────────────────────────┘                    │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  Shared Package: TypeScript interfaces, enums,   │
│  request/event models used by both client & server│
└──────────────────────────────────────────────────┘
```
