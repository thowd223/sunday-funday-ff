# Sunday Funday — Current State (as of 2026-07-09)

This replaces an earlier handoff doc that described a pre-React prototype (standalone
HTML apps + an Excel workbook). That approach was abandoned; everything below reflects
the actual shipped app.

## What this is

A React + TypeScript + Vite static site (`sunday-funday-ff`) — a fantasy football league
chronicle for "Sunday Funday" (12 teams, 14 seasons, 2012–2025). No backend; all data is
bundled JSON, built once from real API pulls and committed to the repo. HashRouter is used
so the built static site works from any host path with no server-side rewrites.

Deployed on Vercel (confirmed live and working by the league owner, July 2026) at
https://sunday-funday-ff-bkvr.vercel.app — the project tracks this repo's only branch.

## Data provenance — read this before touching any data file

- **2012–2018 (ESPN era)**: pulled directly from ESPN's Fantasy API, league ID `561849`,
  via `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/leagueHistory/561849`
  (the `leagueHistory` endpoint, not the per-season endpoint — ESPN's modern API doesn't
  serve pre-2018 seasons through the per-season path at all, only through leagueHistory).
  Required authenticated cookies (`SWID` + `espn_s2`) from the user's own ESPN account —
  those cookies are NOT stored anywhere in this repo; if you need to re-pull ESPN data,
  the user has to supply fresh ones (DevTools → Application → Cookies →
  fantasy.espn.com). This data is frozen — the ESPN league is inactive, it will never
  change, so there is no refresh need for these seasons, only extension (e.g. draft data
  for other purposes).
- **2019–2025 (Sleeper era)**: pulled from Sleeper's public API (no auth needed),
  league chain in `src/data/league_data.json` under `league_chain_by_season`. **This DOES
  need periodic re-pulling** as new seasons complete — see "Known open items" below.
- League was named "National Beer League" in 2012, renamed to "Sunday Funday" from 2013 on.
- Manager identity mapping (Sleeper handle → real name) lives in
  `league_data.json.manager_identity`. Two franchise slots were folded across an owner
  change: TylerKeel's slot includes an earlier "Robertson"-owned portion (2012), and
  dnevels8's slot includes an earlier "Engler"-owned portion (2012–2015ish). This was
  confirmed directly against ESPN's raw member list, not just the old source file's
  footnotes — don't re-litigate it.

## Known data corrections applied this session (do not "fix" these back)

1. **2015 championship**: ESPN's raw API data (single-week score, `rankCalculatedFinal`
   field) shows jphn744 winning the week-16 final 170–155 over peterbrune. **This is
   wrong** — the user confirmed 2015 was an anomaly year where the league manually
   combined two weeks of scoring for the championship game outside ESPN's own bracket
   system, and peterbrune actually won. The site correctly shows peterbrune as 2015
   Champion. This is annotated in `data/full_league_history.json` under
   `meta.corrections_applied` — if you ever regenerate data from raw ESPN pulls, you
   MUST re-apply this override or the champion will silently flip back to wrong.
2. **Sleeper losers-bracket results were inverted**: Sleeper's `losers_bracket` API
   field `w` (winner) tracks *bracket advancement*, not who actually won that game.
   All 49 losers-bracket games in the dataset had this checked against real weekly
   scores and every single one needed correcting. If you ever re-pull Sleeper bracket
   data, do NOT trust the `w` field directly for losers-bracket games — recompute the
   actual winner from `/matchups/{week}` scores, same as the fix in this session did.
3. **Playoff win/loss records exclude consolation-bracket games.** Only real
   championship-bracket games (ESPN `WINNERS_BRACKET` + `WINNERS_CONSOLATION_LADDER`
   placement games; Sleeper `winners_bracket`) count toward a manager's playoff record.
   Toilet-bowl games (ESPN `LOSERS_CONSOLATION_LADDER`, Sleeper `losers_bracket`) are
   flagged `consolation: true` on the game entry and excluded from win/loss totals —
   they still show up in game logs, just labeled "Consolation" instead of "Playoffs".
   Before this fix, career playoff records were inflated (e.g. one manager showed
   18-9 across a single playoff appearance).

## Data pipeline / file map

```
data/
  full_league_history.json   — the canonical source of truth. Every season, every
                                manager, every game (regular + playoff), real scores,
                                authoritative results, correction annotations in
                                .meta. NOT imported by the app directly — it's the
                                staging file the bundled src/data/*.json are derived
                                from. If you regenerate anything, regenerate FROM here
                                or update this file first, then re-derive the bundles.

src/data/
  league_data.json     — season-by-season standings (w/l/pf/pa/result per manager
                         per season). Imported by src/data/league.ts.
  matchup_log.json     — full flat game log, every real game from both sides'
                         perspective, WITH real scores and a `consolation` flag.
                         Powers Head-to-Head and manager Game Log.
  playoff_brackets.json — per-season per-manager ordered list of real bracket games
                         (round/tier/place, scores, consolation flag). Powers
                         PlayoffBracket.tsx.
  playoff_records.json — per-season per-manager {wins, losses} — championship-path
                         games only, post consolation-exclusion fix.
  draft_history.json   — every pick, every season, both eras (ESPN needed the
                         authenticated leagueHistory pull + a separate player-name
                         lookup since ESPN draft picks are player IDs only; Sleeper
                         embeds player names directly in pick metadata).
  trade_history.json   — Sleeper era only (2019+). ESPN's transaction API
                         (`mTransactions2` view, and others tried) returns nothing
                         useful for historical leagues anymore — confirmed dead, not
                         a bug in the pull script. If you want 2012-2018 trades, the
                         only path found so far is parsing real ESPN trade-notification
                         emails from the user's Gmail (rich detail exists there, never
                         extracted into structured data).
  badges.ts            — hand-written "career story" blurbs per manager. Rewritten
                         this session to fix factual errors (see git log) and to
                         read as plain league color, not internal dev/process notes.
```

`src/data/league.ts` is the typed access layer over all of the above — read it first,
it's the single source of truth for what's importable and how.

## Known open items

(The Vercel deployment was confirmed live in July 2026 — no longer an open item. A
Sleeper data-refresh pipeline was considered and explicitly descoped by the league
owner; if it's ever revived, the approach is straightforward: re-run the public
Sleeper API pulls — matchups, brackets, draft, transactions per season — regenerate
`data/full_league_history.json` with the correction-annotations logic re-applied,
then rebuild the `src/data/*.json` bundles. ESPN-era files never change.)

### Smaller/optional
- Bundle is ~575 kB of JSON in one `league-data` chunk (65 kB gzipped) — fine for a
  12-person site, revisit only if it ever feels slow.
- No per-game score data exists for anything before this session's enrichment — it's
  there now for all 2,548 games, but if you ever rebuild `matchup_log.json` from
  scratch, make sure the enrichment step (pulling real weekly points and attaching
  pf/pa to every game, especially playoff games) isn't skipped again.
- Trade history has no ESPN-era data (see above) — either accept the gap or invest in
  email-parsing if it matters.

## Architecture notes for whoever picks this up

- Static site, `HashRouter`, no backend, no auth, no env vars, no CI beyond `npm run
  typecheck` and `npm run build` (both should be run before any commit).
- Routes: `/`, `/seasons` (+ `/seasons/:year`), `/hall-of-fame`, `/awards` (absorbed
  the old `/records`, which now redirects here), `/managers` (+ `/managers/:manager`),
  `/head-to-head`, `/rivalries` (+ `/rivalries/:a/:b`), `/luck`, `/draft-history`
  (+ `/draft-history/:year`), `/draft-grades`, `/trades`, `/stories`. `/champions`
  redirects to `/seasons`.
- `src/lib/stats.ts`, `src/lib/h2h.ts`, `src/lib/records.ts`, `src/lib/luck.ts`,
  `src/lib/rivalry.ts` hold the derived-stat logic; keep new computed stats there
  rather than inline in page components.
- Season-detail and manager-detail pages both derive their selected year/season from
  the URL or local component state respectively — see those files for the pattern if
  adding another drill-down view.
