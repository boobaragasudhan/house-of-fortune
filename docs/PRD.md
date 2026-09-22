# House of Fortune Product Requirements Document

## 1. Product summary

House of Fortune is a 5-level competitive casino tournament built around one original game, Fortune Draw. Players use virtual credits to wager, reveal a 3x3 board, secure rewards, and choose whether to BANK or RISK as they progress toward the championship.

## 2. Product goals

- Make tournament progression obvious.
- Make BANK vs RISK the core decision mechanic.
- Deliver a premium tournament interface.
- Keep the hackathon demo in virtual credits only.
- Isolate randomness behind a chain-integration boundary.
- Prepare the codebase for authoritative multiplayer and settlement.

## 3. Tournament structure

| Level | Name | Players | Reward |
|---|---|---:|---:|
| 1 | The Offer | 8 | 1,500 |
| 2 | The Risk | 6 | 3,000 |
| 3 | The Vault | 5 | 6,000 |
| 4 | The Fortune | 3 | 12,000 |
| 5 | The Championship | 2 | 25,000 |

## 4. Core user flow

```text
Home
 -> Tournament Lobby
 -> Current level
 -> Place virtual wager
 -> Receive Fortune Board
 -> Reveal tiles
 -> See potential reward
 -> BANK or RISK
 -> Advance / lose / cash out
 -> Championship / Final Stats
```

## 5. Fortune Draw requirements

The game uses a 3x3 hidden board.

Symbols:
`FORTUNE`, `CROWN`, `GOLD`, `SPADE`, `DIAMOND`, `VAULT`, `SHADOW`, `RISK`, `WILD`.

Current paytable in `apps/web/src/game/gameConfig.ts`:

| Combination | Multiplier |
|---|---:|
| 3 Gold | 2x |
| 4 Gold | 4x |
| 5 Gold | 7x |
| 2 Crown | 10x |
| 2 Fortune | 15x |
| Fortune + Crown | 25x |
| Full Board | 500x |

The final declared RTP must be validated against the actual outcome distribution before being treated as a verified production figure.

## 6. Decision mechanic

### BANK

Secure the current potential reward, settle it once, and progress to the next tournament level.

### RISK

Continue revealing while the risk condition is satisfied. If the improvement condition fails, the round can bust.

## 7. Wallet requirements

The demo exposes:
- available virtual credits
- active wager
- secured tournament reward
- current potential reward
- transaction history
- demo credit top-up
- demo reset

Rule: the same wager must never be deducted twice.

## 8. Player identity

Allow player name and team name customization, with input sanitization before display.

## 9. UX requirements

### Home
- premium black / emerald / antique-gold identity
- clear tournament entry CTA
- explicit virtual-credit demo scope

### Lobby
- five-level progression map
- current stage emphasized
- completed stages marked
- future stages locked
- reward and player count visible

### Game
- Fortune Draw board is the visual focus
- wager and potential reward remain visible
- BANK and RISK actions are explicit
- result overlays communicate outcome and progression

## 10. Audio and motion

- cinematic intro
- reveal feedback
- win/loss feedback
- volume control
- sound toggle
- production version should respect reduced-motion preferences

## 11. Technical requirements

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide
- Framer Motion

### Backend
- Node.js
- Express
- Socket.IO
- Zod-ready validation boundary

### Data
- Prisma
- SQLite in the current schema

### Monorepo
- npm workspaces
- shared TypeScript domain package
- game-engine package boundary

## 12. Chain requirements

Integration boundary:
`apps/web/src/chain/vrf.ts`

Production requirements:
- verifiable randomness
- server or chain authority over outcomes
- replay-safe request identifiers
- idempotent settlement
- no browser-generated reward authority

## 13. Non-functional requirements

- type-safe domain model
- reproducible production builds
- no committed secrets
- Node 20 runtime target
- responsive UI
- clear separation of presentation and game logic
- testable reward calculation

## 14. Security requirements

Production should address:
- authentication
- authorization
- request validation
- replay protection
- double-settlement prevention
- rate limiting
- server-authoritative game state
- secure randomness
- audit logging

## 15. Roadmap

### P0: Hackathon demo
Stable tournament flow, Fortune Draw, virtual wallet, BANK/RISK, premium UI, deployment.

### P1: Production architecture
Authoritative Chain VRF integration, trusted game service, persistent tournament state, idempotent wallet ledger.

### P2: Multiplayer
Matchmaking, live player state, synchronization and reconnection.

### P3: Verification and scale
RTP test suite, security review, observability, load testing and deployment automation.

## 16. Constraints

- virtual credits only
- current VRF adapter is a demo simulation
- RTP is not mathematically verified by this PRD
