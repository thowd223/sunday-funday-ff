# Sunday Funday — League Chronicle

A frontend-only web app that brings a 14-season fantasy football league to life:
season history, playoff brackets, draft boards, trades, a Hall of Fame leaderboard,
career badges, and a drillable head-to-head grid — all from real league data.

Built with **React + Vite + TypeScript**. All history data is bundled — the app works
fully offline, no network calls at runtime.

## Getting started

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
npm run typecheck   # tsc --noEmit
npm run build       # type-check + production build to dist/
npm run preview     # serve the production build locally
```

## What's inside

| Page | What it shows |
|------|---------------|
| **Overview** | League-wide totals, reigning champion, recent seasons |
| **Seasons** | Index of every season (champion, runner-up, best record, top scorer) drilling into full standings, a real playoff bracket, and that season's trades |
| **Hall of Fame** | Sortable all-time career leaderboard |
| **Awards** | Manager career badges, yearly superlatives, career luck ratings, and a records book (streaks, biggest blowout, closest game, most lopsided rivalry) |
| **Managers** | Directory + per-manager career pages (rivalries, season-by-season, full game log) |
| **Head-to-Head** | All-time pairwise record matrix — click any cell for the full game-by-game history between two managers |
| **Draft History** | Every pick, every season, both eras |

`/champions` and `/records` still work as redirects into `/seasons` and `/awards`.

## Data

All bundled data is real, pulled directly from ESPN's and Sleeper's APIs — nothing here
is hand-curated or estimated. **See `docs/HANDOFF.md` for full provenance, known data
corrections that must not be reverted, and the current open work.** Short version:

- **2012–2018**: ESPN Fantasy API (league `561849`), authenticated pull.
- **2019–2025**: Sleeper's public API.
- **2026** is pre-draft (no games) and excluded from every stat.
- Trade history only exists for 2019+ — ESPN's transaction API no longer serves
  historical data for old leagues.

Key files:
- **`src/data/league.ts`** — typed access layer over every bundled dataset; read this
  first to see what's available.
- **`src/lib/stats.ts`**, **`src/lib/h2h.ts`**, **`src/lib/records.ts`** — derived-stat
  logic (win %, luck rating, head-to-head matrix, records/streaks).
- **`data/full_league_history.json`** — the canonical staging file everything else is
  derived from; not imported by the app directly.

## Notes

- Routing uses `HashRouter`, so the built static site deep-links correctly from any host
  without server rewrites.
- No backend, no auth, no env vars.
