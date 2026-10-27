# LastMile Aid — Smart Surplus Food & Emergency-Aid Coordination Platform

**Complete Turnkey Implementation — Frontend, Backend, and API/Data Layer**

LastMile Aid is a responsive civic-tech web platform designed to coordinate time-sensitive surplus food and emergency aid between **Donors**, **Volunteer Riders**, **Emergency Public Helpers**, **Verified Receiving Shelters/NGOs**, and **Administrators**.

Unlike generic donation boards, LastMile Aid is powered by a **deterministic dispatch engine** that strictly enforces:
- **FEFO (First Expiring, First Out)** with a configurable safety buffer (default 20 minutes).
- **Vehicle capacity constraints** (automatically slicing bulk donations into <=40-meal tasks).
- **Certified facility capabilities** (clean water, cooking fuel, cold-chain refrigeration, dry storage, infant care protocol).
- **Time-limited atomic claims** with automatic background TTL expiry sweeper workers.
- **Mid-delivery rerouting** when a receiving shelter becomes full or closed.
- **Idempotent credit ledger** ensuring credits are awarded exactly once upon receipt verification.
- **Open Gate fallback** for direct walk-in distribution.

---

## 1. System Architecture Overview

```
AIHAC/
├── shared/                         # Shared Type Definitions & Zod Invariants
│   └── src/
│       ├── types.ts                # TypeScript Interfaces & Domain Models
│       ├── constants.ts            # Categories, Invariant Constants & Urgency Rules
│       ├── schemas.ts              # Zod Request Validation Schemas
│       └── index.ts
│
├── backend/                        # Express + TypeScript + Socket.IO API
│   ├── src/
│   │   ├── services/
│   │   │   ├── matchingEngine.ts   # Core FEFO Dispatch & Multi-Task Slicing
│   │   │   ├── routeEstimator.ts   # Haversine + Detour + Handling Time Estimator
│   │   │   ├── donationService.ts  # Donation Creation & Expiry Shortening Rules
│   │   │   ├── taskService.ts      # Atomic Single-Winner Claims, Transit & Verification
│   │   │   ├── rerouteService.ts   # Dynamic Alternative Shelter Proposal on Full/Closed
│   │   │   ├── siteService.ts      # Demand Capacity & Capability Management
│   │   │   ├── openGateService.ts  # Direct Walk-in Distribution Mode
│   │   │   └── creditService.ts    # Append-Only Ledger & Leaderboard
│   │   ├── workers/
│   │   │   ├── claimExpiry.ts      # 30s Claim TTL Sweeper (Ghost Claim Recovery)
│   │   │   ├── listingClosure.ts   # 30s Open Gate Window Closer
│   │   │   ├── expirySweeper.ts    # 60s Food Shelf-Life Sweeper
│   │   │   └── scheduler.ts        # Background Cron Supervisor
│   │   ├── realtime/
│   │   │   └── socketServer.ts     # Socket.IO Event Broadcaster & Time Sync
│   │   ├── routes/                 # REST Endpoints (Auth, Donations, Tasks, Sites, Admin)
│   │   ├── app.ts                  # Express App Definition
│   │   └── server.ts               # HTTP & WebSocket Server Startup
│   └── tests/
│       └── mvp_proofs.test.ts      # Automated Vitest Tests Proving All 6 PRD Scenarios
│
└── frontend/                       # React 18 + TypeScript + Vite + Tailwind CSS
    ├── src/
    │   ├── api/
    │   │   ├── client.ts           # Swappable API Interface
    │   │   ├── mockApi.ts          # Zero-Dependency Standalone Browser Mock Engine
    │   │   ├── httpApi.ts          # Live Backend HTTP API Client
    │   │   └── seed.ts             # PRD Scenario 1 Baseline Seed Data
    │   ├── realtime/               # WebSocket & Mock Realtime Adapters
    │   ├── components/             # Reusable UI Components
    │   │   ├── common/             # Badges, Countdowns, Alerts, Banners
    │   │   ├── layout/             # Responsive AppShell & Role Switcher
    │   │   ├── donation/           # Donation Cards, Progress Bars, Allocation Tables
    │   │   ├── task/               # Task Board, Steppers, Reroute Cards
    │   │   ├── site/               # Status Switches, Demand Editors, Capability Toggles
    │   │   ├── admin/              # Simulation Console & Audit Explorer
    │   │   └── map/                # Leaflet Live Map with Accessible Fallbacks
    │   └── pages/                  # 18 Complete Application Pages
```

---

## 2. Section Walkthrough: Frontend

The frontend is built according to `FRONTEND_UI_SPEC.md` using **React 18**, **Vite**, **TypeScript**, and **Tailwind CSS**.

### Key Highlights:
1. **Role Switcher in Header**: Instant 1-click toggling between **Donor**, **Rider**, **Emergency Helper**, **Shelter Operator**, and **Admin** personas.
2. **Authoritative Server Countdown (`CountdownTimer.tsx`)**: Synchronized to server time offsets via periodic `time.sync` events to prevent client device clock manipulation.
3. **Multi-Task Allocation Inspector (`AllocationTable.tsx`)**: Displays how donations are split into batches with an expandable *"Why this assignment?"* drawer detailing candidate rejections and travel times.
4. **Interactive Leaflet Live Map (`LiveMap.tsx`)**: Plots colored urgency markers for pickups, destination pins, and active transit paths, including an **Accessible List View** for keyboard navigation.
5. **Dynamic Reroute Proposal (`RerouteProposalCard.tsx`)**: Surfaces alternative shelters when a destination becomes full, displaying ETA and deadline headroom with Accept/Decline actions.
6. **Swappable API Layer (`mockApi.ts` / `httpApi.ts`)**: Can run standalone in the browser with full client-side invariant logic or connect directly to the Express backend.

---

## 3. Section Walkthrough: Backend

The backend is built with **Node.js**, **Express**, **TypeScript**, and **Socket.IO**.

### Key Highlights:
1. **Deterministic Dispatch Engine (`matchingEngine.ts`)**:
   - Analyzes shelter unmet demand and item capability requirements.
   - Filters candidate sites based on travel time + 20-minute safety buffer.
   - Slices bulk donations (e.g. 180 meals) into multiple rider-sized tasks (<=40 meals each).
2. **Invariants Enforced (INV-1 through INV-10)**:
   - `INV-1`: ETA + safety buffer <= expiry deadline.
   - `INV-2`: Atomic conditional claim prevents double reservations.
   - `INV-3`: Sum of allocations <= total donation quantity.
   - `INV-4`: Task quantity <= rider's declared carrying capacity.
   - `INV-5`: Shelter reserved quantity <= declared unmet demand.
   - `INV-6`: Item requirements must be a subset of site capabilities.
   - `INV-7`: Credits awarded at most once via unique `(eventType, subjectId, userId)` constraint.
   - `INV-9`: Expiry date can only be shortened for food safety; never extended.
   - `INV-10`: Authoritative server clock used for all transitions.
3. **Automated Background Workers (`workers/`)**:
   - `claimExpiry`: Scans for stale claims every 30s and returns unacknowledged tasks to the pool.
   - `listingClosure`: Closes Open Gate windows upon supply exhaustion or end time.
   - `expirySweeper`: Marks undistributed surplus as `EXPIRED_UNDELIVERED`.
4. **Realtime WebSocket Server (`realtime/socketServer.ts`)**: Emits transactional updates and 15-second clock sync pulses.

---

## 4. Section Walkthrough: API & Data Layer

### Core REST Endpoints:
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/time/now` | Authoritative server clock ISO timestamp |
| `POST` | `/api/auth/login` | Session login with demo persona support |
| `GET` | `/api/donations` | List donations sorted FEFO by expiry |
| `POST` | `/api/donations` | Post surplus donation and trigger auto-dispatch |
| `POST` | `/api/donations/:id/open-gate` | Switch donation mode to walk-in distribution |
| `GET` | `/api/tasks/available` | Browse available delivery tasks |
| `POST` | `/api/tasks/:id/claim` | Atomic single-winner claim |
| `POST` | `/api/tasks/:id/acknowledge` | Acknowledge delivery within TTL window |
| `POST` | `/api/tasks/:id/pickup` | Confirm goods loaded into vehicle |
| `POST` | `/api/tasks/:id/deliver` | Confirm handover at shelter |
| `POST` | `/api/tasks/:id/verify` | Shelter operator verifies intake & awards credits |
| `POST` | `/api/tasks/:id/reroute/accept` | Accept proposed alternative shelter |
| `PATCH` | `/api/sites/:id/status` | Change shelter status (OPEN, FULL, CLOSED) |
| `PUT` | `/api/sites/:id/demand` | Update shelter unmet category demand |
| `PUT` | `/api/sites/:id/capability` | Toggle certified facility capabilities |
| `POST` | `/api/admin/sim/*` | Simulation console triggers for demo scenarios |

---

## 5. Verification: PRD MVP Proof Scenarios

The test suite in `backend/tests/mvp_proofs.test.ts` proves the **6 critical operational scenarios** required by PRD Section 1.1:

1. **Proof 1 (180-Meal Multi-Task Splitting)**: A 180-meal donation is sliced into multiple tasks respecting rider capacity (<=40 meals) and shelter demands (Asha: 50, Bright Future: 80, Care Home: 50).
2. **Proof 2 (Ghost Claim Expiry)**: A claimed task whose TTL expires is automatically returned to the `OPEN` pool by the background worker.
3. **Proof 3 (Full Shelter Rerouting)**: When a shelter turns `FULL` mid-delivery, the reroute service generates a feasible alternative destination without false success.
4. **Proof 4 (Safety Incompatibility Rejection)**: Perishables requiring refrigeration are strictly rejected for sites lacking that capability.
5. **Proof 5 (Exact-Once Credit Idempotency)**: Credits are awarded only after receipt verification and duplicate attempts are rejected.
6. **Proof 6 (Open Gate Fallback)**: Organizers can fall back to walk-in distribution and track handouts until supply exhaustion.

---

## 6. How to Run & Develop

### Prerequisites:
- Node.js v18+ (tested on Node v24.15)
- npm or pnpm

### Quick Start:

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run All Automated Tests:**
   ```bash
   npm test
   ```

3. **Start Full-Stack Development Mode (Backend + Frontend):**
   ```bash
   npm run dev
   ```
   - **Frontend App:** http://localhost:3000
   - **Backend API:** http://localhost:4000
   - **Admin Simulation Console:** http://localhost:3000/admin/console
