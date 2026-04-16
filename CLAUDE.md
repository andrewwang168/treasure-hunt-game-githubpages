# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all dependencies (root + server)
npm install && cd server && npm install

# Start both frontend (port 3000) and backend (port 3001) concurrently
npm run dev

# Build frontend for production (output: build/)
npm run build
```

Before first run, copy and configure the server environment:
```bash
cp server/.env.example server/.env
# Set JWT_SECRET to a long random string in server/.env
```

The root `npm run dev` uses `concurrently` to start both servers together. To run individually: `npm run dev:client` or `npm run dev:server`.

## Architecture

Full-stack treasure hunt game: React + Vite + TypeScript frontend, Express + libsql (SQLite) backend.

### App entry & rendering (`src/main.tsx`)

`Root` component wraps everything in `AuthProvider` and decides what to render:
- While loading (token validation): loading spinner
- If `showAuth` is true: `AuthScreen`
- Otherwise: `App` (the game)

`Toaster` (sonner) is mounted globally here at `position="top-center"`.

### Frontend game logic (`src/App.tsx`)

All game state and logic lives here.

**Key state:** `boxes: Box[]` (each has `id`, `isOpen`, `hasTreasure`), `score: number`, `gameEnded: boolean`

**Game flow:**
- `initializeGame()` — creates 3 boxes, randomly assigns treasure to one; resets score and `gameEnded`
- `openBox(id)` — plays audio, updates score (+$150 treasure / -$50 skeleton), marks box open, sets `gameEnded` when treasure is found or all boxes opened
- Score is auto-saved via `saveScore()` (effect on `gameEnded`) for authenticated users only; guest scores are not saved

**Auth modes:** `currentUser` (signed-in user) vs `isGuest` (playing without account). Both allow gameplay; only `currentUser` triggers score persistence.

### Auth flow

- `src/context/AuthContext.tsx` — `AuthProvider` wraps the app; provides `currentUser`, `isGuest`, `isLoading`, `signIn`, `signUp`, `signOut`, `playAsGuest` via `useAuth()` hook; JWT stored in `localStorage` as `authToken`; token is validated via `GET /api/auth/me` on load and cleared on 401
- `src/components/AuthScreen.tsx` — login/signup UI; shown when `showAuth` is true in `main.tsx`
- `src/lib/api.ts` — all fetch calls; reads `authToken` from localStorage and attaches as `Authorization: Bearer`; `API_BASE` comes from `VITE_API_URL` env var (empty string in dev, proxied through Vite or set explicitly)

**Path alias:** `@/` maps to `src/`.

**UI stack:** Tailwind CSS 4 + shadcn/ui (`src/components/ui/`) + Motion (Framer Motion) for animations + Radix UI primitives + sonner for toasts.

### Backend (`server/src/`)

- `index.ts` — Express entry; configures CORS (`ALLOWED_ORIGINS` env var, defaults to `http://localhost:3000`), mounts `/api/auth` and `/api/scores`
- `db.ts` — creates libsql client; uses Turso cloud DB if `TURSO_URL` env var is set, otherwise local file at `server/data/game.db`; initializes `users` and `scores` tables
- `routes/auth.ts` — `POST /signup` (bcrypt hash, returns JWT), `POST /signin` (verify hash, returns JWT), `GET /me` (requires auth middleware)
- `routes/scores.ts` — `POST /scores` (requires auth); saves `score`, `result` (`win`|`tie`|`loss`) linked to `userId`
- `middleware/auth.ts` — verifies JWT, attaches `req.userId`

**Server env vars** (`server/.env`, see `server/.env.example`): `JWT_SECRET`, `PORT`, `TURSO_URL`, `TURSO_AUTH_TOKEN`, `ALLOWED_ORIGINS`
