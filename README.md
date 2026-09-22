# House of Fortune

> A 5-level competitive casino tournament built around an original **Fortune Draw** game. Players wager virtual credits, reveal outcomes, secure rewards, and choose whether to BANK or RISK as they progress toward the championship.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Node](https://img.shields.io/badge/Node-20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

## Live Demo

**Game URL:** https://endearing-duckanoo-ff133a.netlify.app/

> Demo credits only. No real-money gambling or cash value is supported.

## What is House of Fortune?

House of Fortune is designed as a **tournament experience first**, not a directory of casino games. One original game, Fortune Draw, powers five escalating competitive levels:

| Level | Title | Players | Reward |
|---|---|---:|---:|
| 1 | The Offer | 8 | 1,500 |
| 2 | The Risk | 6 | 3,000 |
| 3 | The Vault | 5 | 6,000 |
| 4 | The Fortune | 3 | 12,000 |
| 5 | The Championship | 2 | 25,000 |

At a decision point, the player can **BANK** the current reward or **RISK** it for a larger potential outcome.

## Fortune Draw

Fortune Draw uses a 3x3 hidden board. Players first place a virtual wager, then reveal tiles to form reward combinations.

Symbols include:

- Fortune
- Crown
- Gold
- Spade
- Diamond
- Vault
- Shadow
- Risk
- Wild

The current implementation exposes a board-generation abstraction in `apps/web/src/chain/vrf.ts`. It is intentionally structured so the local/demo randomness layer can later be replaced by authoritative Chain VRF / Chain Casino SDK integration.

## Architecture

```text
                         HOUSE OF FORTUNE
                                |
                 +--------------+--------------+
                 |                             |
            React Web App                 Node/Express API
            apps/web                     apps/server
                 |                             |
        +--------+---------+             Socket.IO
        |                  |
   UI / Pages         Game State
        |                  |
        +--------+---------+
                 |
        Tournament Context
                 |
       +---------+----------+
       |                    |
 Fortune Draw Engine    Chain VRF Adapter
       |                    |
       +---------+----------+
                 |
          Shared Type Model
          packages/shared
                 |
       +---------+----------+
       |                    |
 Game Engine Package    Prisma Database
 packages/game-engine    packages/database
```

### Repository structure

```text
house-of-fortune/
├── apps/
│   ├── web/                  # React + Vite frontend
│   │   └── src/
│   │       ├── pages/        # Home, Lobby, Fortune Draw, Winner
│   │       ├── components/   # Game UI and modals
│   │       ├── game/         # Tournament state, paytable, audio
│   │       └── chain/        # VRF integration boundary
│   └── server/               # Express + Socket.IO backend
├── packages/
│   ├── shared/               # Shared TypeScript game/domain types
│   ├── game-engine/          # Game-engine package boundary
│   └── database/             # Prisma schema and data layer
├── docker-compose.yml
├── package.json
└── README.md
```

## Product Requirements Document

### 1. Problem

Traditional casino-style demos often optimize for isolated games. House of Fortune instead focuses on **progression, competitive tension, and player decisions** by wrapping one original game inside a multi-level tournament.

### 2. Goal

Create a premium, easy-to-understand tournament demo where a player can:

1. Enter a tournament.
2. See progression through five levels.
3. Place a virtual wager.
4. Receive a generated Fortune Draw board.
5. Reveal tiles.
6. See the potential reward update.
7. Decide whether to BANK or RISK.
8. Advance until cashing out, being eliminated, or reaching the championship.

### 3. Core user flow

```text
Home
  ↓
Tournament Lobby
  ↓
Level 1 → Place Wager → Generate Board
  ↓
Reveal Tiles
  ↓
BANK ───────────────→ Secure Reward → Next Level
  │
  └── RISK → Reveal More → Improve or Bust
                         ↓
                Continue / Lose / Cash Out
                         ↓
                Level 2 → Level 3 → Level 4 → Level 5
                         ↓
                    Final Stats
```

### 4. Functional requirements

- Virtual-credit wallet.
- Configurable demo wager amounts.
- 3x3 Fortune Draw board.
- Deterministic game-state transitions for the UI.
- Tournament levels with player counts and rewards.
- BANK / RISK decision loop.
- Secured reward tracking.
- Result overlays.
- Player/team identity.
- Demo credit top-up and reset.
- Sound controls and volume.
- Backend health endpoint.
- Socket.IO tournament-room foundation.

### 5. Non-functional requirements

- Responsive web UI.
- Fast Vite production build.
- TypeScript across frontend/backend/shared packages.
- Clear separation between UI, game state, domain types, and chain integration.
- No real-money transactions.
- No secrets committed to source control.
- Node 20 runtime target for deployment compatibility.

## Design system

The interface follows a premium casino-tournament visual language:

- Black: `#090909`
- Deep emerald: `#063B2A`
- Antique gold: `#D4AF37`
- Ivory: `#F5F0E6`
- Dark red used sparingly for risk/loss states

The tournament map is central to the experience, while the Fortune Draw board becomes the primary focus during play.

## Game economics

The current paytable is defined in `apps/web/src/game/gameConfig.ts`.

| Combination | Multiplier |
|---|---:|
| 3 Gold | 2x |
| 4 Gold | 4x |
| 5 Gold | 7x |
| 2 Crown | 10x |
| 2 Fortune | 15x |
| Fortune + Crown | 25x |
| Full Board | 500x |

**RTP note:** the repository currently contains a `calculateTheoreticalRTP()` helper returning 95.5% as a development assertion. The Chain Jam submission declared 96%. A production implementation should replace this assertion with a full combinatorial or simulation-based validation against the final authoritative paytable and outcome distribution.

## Chain / randomness integration

The current code uses `ChainVRF` as an integration boundary:

```text
placeWager()
   ↓
requestRandomness()
   ↓
determineOutcome()
   ↓
3x3 Fortune Board
   ↓
player reveal decisions
```

At present, `apps/web/src/chain/vrf.ts` simulates the integration with local randomness. For a production-grade deployment, the board outcome should come from the authoritative Chain VRF / Chain Casino SDK rather than browser-side `Math.random()`.

## Development

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

### Production build

```bash
npm run build
```

The frontend is under `apps/web`; the backend is under `apps/server`.

## Deployment

The repository contains deployment-ready frontend source and a Node 20 `.nvmrc`.

For Netlify/Vite deployment, the frontend build output is:

```text
apps/web/dist
```

For a monorepo-aware build:

```bash
npm run build
```

## Hackathon submission

- **Project:** House of Fortune
- **RTP declared:** 96%
- **Source:** https://github.com/boobaragasudhan/house-of-fortune
- **Demo:** https://endearing-duckanoo-ff133a.netlify.app/

## Roadmap

### Phase 1
- Finalize tournament UX.
- Validate reward accounting and wallet invariants.
- Remove unused legacy game placeholders.

### Phase 2
- Replace simulated randomness with authoritative Chain integration.
- Move outcome validation to a trusted server/chain boundary.
- Add robust transaction/event persistence.

### Phase 3
- Multiplayer tournament synchronization.
- Tournament matchmaking and real-time player state.
- Immutable tournament result records.

### Phase 4
- Automated RTP testing.
- Security review.
- Production observability and deployment automation.

## Safety / demo scope

House of Fortune is a **virtual-credit hackathon demo**. It does not process deposits, withdrawals, or real-money gambling.

## License

This project is currently presented as a hackathon submission. Add a formal license before external redistribution or reuse.
