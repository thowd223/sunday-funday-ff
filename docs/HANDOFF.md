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
  `league_data.json.manager_identity`. A prior version of this doc claimed TylerKeel's
  and dnevels8's franchise slots were continuations of earlier "Robertson"- and
  "Engler"-owned portions — **that claim was wrong** and has been corrected (see
  correction #4 below). They're unrelated managers with their own identities
  (`KRobertson`, `amenr5`), confirmed against ESPN's raw `leagueHistory` API member
  list (`view=mTeam`) at the win/loss-record level, not just surname matching.

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
4. **TylerKeel's 2012/2013 rows and dnevels8's 2015 row were misattributed** — this was
   the opposite of the "folded franchise lineage" story a prior version of this doc
   told. Verified by pulling ESPN's raw `leagueHistory` API (`view=mTeam`) directly and
   cross-checking every 2012-2018 team's `primaryOwner` + win/loss record against the
   site's data: 2012 and 2013's roster slot 7 belonged to **Keith Robertson** (4-8,
   then 3-10), who left the league before the 2014 season — Tyler Keel then joined as
   an entirely new, unrelated franchise (roster slot 11) in 2014, not a continuation of
   Robertson's team. Separately, 2015's roster slot 12 belonged to **Andy Engler**
   (8-5, "Team Engler," playoff seed 6) — a one-season manager who left before devin
   nevels took over that same slot number in 2016. Andy Engler resurfaced in the league
   in 2023 under the Sleeper handle `amenr5`, making him the only manager in league
   history to leave and return. New manager identity `KRobertson` (Keith Robertson) was
   added for his two-season stint; `amenr5`'s identity now spans both his 2015 ESPN
   season and his 2023+ Sleeper return. All of `matchup_log.json`,
   `playoff_brackets.json`, `playoff_records.json`, `draft_history.json`, and
   `data/full_league_history.json` were corrected to match, including every mirrored
   opponent-side game entry. If you ever regenerate data from raw ESPN pulls, do NOT
   trust surname-only matching or "which Sleeper handle inherited this roster slot
   number" — verify against the actual `primaryOwner` member ID and win/loss record for
   each individual season, the same way this correction was made. This stat-level fix
   stands regardless of franchise grouping below — Keel's individual career numbers still
   correctly exclude Robertson's 2012-2013 record even though the two are now linked as
   one franchise lineage (see "Franchises" section below, `robertson-keel`).

## Franchises — persistent seats vs. individual owners

The league has two overlapping notions of "who": the **owner** (a real person, tracked
by manager handle — every stat page other than Hall of Fame and `/franchises` defaults to
this) and the **franchise** (a competitive seat that can outlive any one owner — Hall of
Fame and `/franchises`/`/franchises/:id` default to this). Head-to-head and rivalries are
owner-only by design — they're personal bragging rights, not seat history.

`src/data/franchises.ts` defines the 4 seats that changed real-world hands. Every other
manager is their own implicit single-owner franchise (`franchiseIdFor` in
`src/lib/franchise.ts` falls back to the manager handle when no explicit lineage exists) —
no per-season franchise-id field was added to the bundled data files, this is computed
purely from the small curated list.

**How the lineages were determined** (2026-07-19 session): the ESPN era and Sleeper era
each expose their own stable per-team-seat identifier, but the two are *completely
unrelated numbering systems* — there is no cross-platform franchise linkage, and a
manager who played continuously across the 2018→2019 switch doesn't need a franchise
entry at all (their season rows already share one manager handle). Three of the four
lineages are backed by hard platform-id evidence; the fourth is not, and is included
solely at the league owner's explicit direction — see below.

- **ESPN era (2012-2018)**: pulled the raw `leagueHistory` API (`view=mTeam`) directly
  and diffed every team's numeric `id` season over season. Of all id transitions across
  2012-2018, exactly one seat was handed to a new owner while keeping the same `id`: team
  id 12 went from Andy Engler (2015, "Team Engler") to devin nevels (2016-2018, "Andre
  Thundacock") with no other continuity (team name changed completely, full redraft, no
  shared roster) — franchise `engler-nevels`.
- **Sleeper era (2019-2025)**: `roster_id` is Sleeper's stable seat identifier, already
  captured in `league_data.json`'s `roster_id_map_2019_2025`. Two seats changed owners:
  roster 6 (JPeters19 2019-2023 → Keughes 2024-2025, franchise `jpeters-keughes`) and
  roster 12 (assif 2019-2022 → amenr5/Andy Engler 2023-2025, franchise `assif-amenr5`).
- **`robertson-keel` — the one exception.** Keith Robertson's ESPN team id (7) was
  **retired** when he left after 2013, not reassigned — Tyler Keel joined in 2014 with a
  brand-new id (11). ESPN's own data says these are unrelated seats, matching the
  misattribution correction in #4 above (Keel's individual stats correctly do NOT include
  Robertson's 2012-2013 record — that fix stands, untouched). The league owner confirmed
  from direct recollection that Keel's arrival was still meant as taking over Robertson's
  seat in the league, so `robertson-keel` is included as a franchise lineage on that
  explicit instruction, layered on top of — not reversing — the stat-level correction.
  Don't treat this as precedent for inferring other franchise links from anything short
  of hard platform-id evidence or an explicit owner confirmation like this one.

Note the asymmetry this produces: Andy Engler's 2015 ESPN season lives in the
`engler-nevels` franchise (displayed under devin nevels' name, since he's the more recent
owner of that seat), while Engler's own personal `/managers/amenr5` page still correctly
shows his full individual career — all 4 of his seasons (2015, 2023-2025) — since owner
stats and franchise stats are deliberately different views over the same underlying data.

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
  the old `/records`, which now redirects here), `/franchises` (+ `/franchises/:id`),
  `/managers` (+ `/managers/:manager`), `/head-to-head`, `/rivalries`
  (+ `/rivalries/:a/:b`), `/luck`, `/draft-history` (+ `/draft-history/:year`),
  `/draft-grades`, `/trades`, `/stories`. `/champions` redirects to `/seasons`.
- `src/lib/stats.ts`, `src/lib/h2h.ts`, `src/lib/records.ts`, `src/lib/luck.ts`,
  `src/lib/rivalry.ts` hold the derived-stat logic; keep new computed stats there
  rather than inline in page components.
- Season-detail and manager-detail pages both derive their selected year/season from
  the URL or local component state respectively — see those files for the pattern if
  adding another drill-down view.
