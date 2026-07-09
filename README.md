# Sunday Funday — League Chronicle

A frontend-only web app that brings a 14-season fantasy football league to life:
champions, standings, a Hall of Fame leaderboard, season superlatives, per-manager
career pages, and a live head-to-head grid.

Built with **React + Vite + TypeScript**. All history data is bundled — the app works
fully offline. The only network calls are optional, on-demand fetches to the public
[Sleeper API](https://docs.sleeper.com/) for the Head-to-Head grid.

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build locally
```

## What's inside

| Page | What it shows |
|------|---------------|
| **Overview** | League-wide totals, reigning champion, your career snapshot, recent seasons |
| **Seasons** | Full final standings for any year (record, PF/PA, point diff, luck rating, playoff result) |
| **Champions** | The podium (champion / runner-up / 3rd / 4th) for every season |
| **Hall of Fame** | Sortable all-time career leaderboard |
| **Awards** | Manager "career badges" + yearly superlatives (top scorer, best record, luckiest/unluckiest) |
| **Managers** | Directory + per-manager career detail pages |
| **Head-to-Head** | Live-built all-time pairwise record matrix from Sleeper weekly matchups |

## Data

- **`src/data/league_data.json`** — the compiled dataset: 162 season-team rows (2012–2025),
  manager identity map, and the season league-ID chain. See `docs/HANDOFF.md` for full
  provenance and methodology.
  - **2012–2018**: manually curated from ESPN-era records, mapped to current Sleeper identities.
  - **2019–2025**: pulled from the Sleeper API.
  - **2026** is pre-draft (no games) and excluded from every stat.
- **`src/data/league.ts`** — typed access layer over the JSON.
- **`src/lib/stats.ts`** — derived stats (win %, Pythagorean expectation, luck rating, career roll-ups).
- **`src/lib/sleeper.ts`** — live Sleeper API client used only by the Head-to-Head page.

### Companion tooling (not part of the web app)

- **`data/Sunday_Funday_League_History.xlsx`** — a 6-sheet Excel workbook of the same history.
- **`scripts/build_workbook.py`** — regenerates the workbook from scratch (openpyxl).

## Notes

- Routing uses `HashRouter`, so the built static site deep-links correctly from any host
  (e.g. GitHub Pages) without server rewrites.
- The Head-to-Head grid makes ~96 requests (one per regular-season week, 2019–2025). The
  Sleeper API is public, needs no auth, and is CORS-open, so it runs straight from the browser.
