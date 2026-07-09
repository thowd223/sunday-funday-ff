# Sunday Funday — Fantasy League Tools: Handoff Package

Context dump for picking this project up in Claude Code. Everything here was built
in a chat session with no persistent code execution or unrestricted network access —
Claude Code has both, so several "manual/interrupted" tasks below should be trivial
to finish properly here.

## What this project is

A Sleeper.app fantasy football league ("Sunday Funday", 12 teams, league ID
`1313676998056378368`) has three deliverables built around it:

1. **`apps/sleeper-draft-warroom.html`** — a live draft assistant. Standalone
   React (via CDN + Babel standalone, no build step) that connects to Sleeper's
   public API, tracks a live draft, supports custom rankings pasted in, and shows
   "survival odds" (will this player be there at your next pick) plus value/ADP
   signals. Fully working, self-contained, open directly in a browser.

2. **`apps/sleeper-league-history.html`** — "League Chronicle." Same stack. Walks
   a league's `previous_league_id` chain back through every season, builds
   champion/standings history, a Hall of Fame leaderboard, and — the newest,
   **unfinished** piece — a head-to-head matchup grid (see "Outstanding work" below).

3. **`data/Sunday_Funday_League_History.xlsx`** — a 6-sheet Excel workbook (README,
   All Seasons, Season Champions, Hall of Fame, Your Career, League Awards) covering
   **2012–2025** (14 seasons: 2012-2018 from a manually-curated ESPN-era source file
   the user uploaded, 2019-2025 pulled live from the Sleeper API). Built with
   `scripts/build_workbook.py` (openpyxl), formulas recalculated via LibreOffice
   headless (`libreoffice --headless` — the script that does this is
   `/mnt/skills/public/xlsx/scripts/recalc.py` in the original environment; you'll
   need your own recalc method, e.g. open once in Excel/LibreOffice, or just trust
   openpyxl's formulas since they were verified working).

All the underlying data — full season-by-season records, playoff results, points
for/against, manager identity mapping, and the season league_id chain — is in
**`data/league_data.json`**, already structured and ready to consume. You should
not need to re-fetch anything from Sleeper's API to extend the Excel workbook;
you only need fresh API calls for genuinely new data (like the head-to-head grid).

## Key identifiers

- Sleeper username: `thowd` (the user, real name Tim Howd), user_id `77161125753798656`
- Current league ID: `1313676998056378368` (2026 season, pre-draft, no games yet — excluded from all stats)
- Full season chain (league_id per year) is in `league_data.json` under `league_chain_by_season`
- Sleeper's public API needs no auth: `https://api.sleeper.app/v1/...`, fully CORS-open,
  fine to call directly from a browser or from a script with normal internet access

## Manager identity mapping (important — read before touching anything)

This league started on ESPN in 2012, then moved to Sleeper for the 2019 season.
The uploaded ESPN source file labeled rows by **surname**, and ownership of some
roster slots changed hands over the years. The user explicitly confirmed this
mapping (do not re-derive it, it's settled):

| Sleeper username | Real name | Notes |
|---|---|---|
| thowd | Tim Howd | **This is the user.** 3 championships (2017, 2019, 2025). |
| jphn744 | John Hartnett | **All-time championship leader, 5 titles.** User initially typo'd this as "jphn755" — confirmed jphn744 is correct via API. |
| YungSimba | Nick Pellegrini | |
| kdavis | Kurtis Davis | Best career win% (62%), most playoff appearances (12), only 2 titles. |
| bcorrigan30 | Brian Corrigan | 6 third-place finishes, 0 titles — the league's perennial bronze medalist. |
| peterbrune | Peter Brune | Set the all-time single-season scoring record (1912.3 pts, 2021) and lost that year's final anyway. |
| JPeters19 | Jordan Peters | Left the league after 2023; replaced by Keughes in the same roster slot from 2024. |
| GBClark | Garrett Clark | |
| SeanOMara | Sean O'Mara | Joined 2015 as an expansion team. |
| TylerKeel | Tyler Keel | Franchise **includes an earlier "Robertson"-era portion** per the source file's own footnote — folded into TylerKeel's career line per user instruction, not tracked as a separate manager. |
| dnevels8 | devin nevels | Joined 2015 as an expansion team. Franchise **includes an earlier "Engler"-era portion** per the source file's footnote — folded in per user instruction. |
| assif | Asif Lakhani | Also appears as "AsifL" in some seasons (same owner_id). Left after 2022; replaced by amenr5 in the same roster slot from 2023. |
| amenr5 | (unknown) | Sleeper-only, joined 2023. Co-owned with "muhiuj" from 2024 (team "Love is Through the Air"). |
| Keughes | (unknown) | Sleeper-only, joined 2024. |

**roster_id has stayed stable for these 12 slots across all 7 Sleeper seasons**
(2019-2025) — see `roster_id_map_2019_2025` in the JSON. This means you can often
skip re-fetching `/rosters` per season if you already know which roster_id maps to
which manager, EXCEPT for the two slots that changed hands (slot 6: JPeters19→Keughes
after 2023; slot 12: assif→amenr5 after 2022).

## Data methodology notes (carry these forward if you extend the workbook)

- **Playoff field size**: 4 teams in the 10-team era (2012-2014), 6 teams from 2015
  on (12-team league). The user corrected this explicitly — don't assume 6 uniformly.
- **"Place Finished" in the ESPN source file is POST-playoff final standing**, not
  regular-season rank. Confirmed by cross-checking against known Sleeper 2019/2020
  results. Regular-season rank for 2012-2018 in the workbook was independently
  computed from win-loss-PF (wins desc, points-for tiebreak) to match the methodology
  used for 2019-2025.
- **2019-2020 blocks in the ESPN source file are redundant with Sleeper data** and
  have at least one confirmed copy-paste data entry error (KEEL/PELLEGRINI rows in
  the 2020 block share an identical PF value that doesn't match real Sleeper data).
  Ignore those two years from the ESPN file entirely; the workbook already does.
- **Luck Rating** = actual win% − Pythagorean-expected win% (points-for^2.37 /
  (points-for^2.37 + points-against^2.37)), the standard football exponent.
- **Team names for 2012-2018** use each manager's single all-time "franchise title"
  from the ESPN file's name key (Sheet2), since no per-season team name was available
  — not necessarily what they were literally called that specific year. Noted in the
  workbook's README sheet.
- If writing MAXIFS/MINIFS (or any post-2007 Excel function) via openpyxl formula
  strings, **you must prefix with `_xlfn.`** (e.g. `_xlfn.MAXIFS(...)`) or Excel/
  LibreOffice will throw `#NAME?` on load. Cost real debugging time in this session —
  don't repeat it.

## Outstanding work (why this handoff exists)

### 1. Head-to-head matchup grid — interrupted, needs a proper finish

The user wants every manager's all-time head-to-head record against every other
manager, using real weekly matchup data (not season aggregates). This requires
`GET /v1/league/{league_id}/matchups/{week}` for every regular-season week of
every Sleeper season — **96 total calls** (13 weeks in 2019 and 2020, 14 weeks
2021-2025; exact `playoff_week_start` per season is in `league_data.json`).

I built this as a feature into `apps/sleeper-league-history.html` (a "Build Grid"
button under a new Head-to-Head Records section — see the `buildH2H` function and
the `GridView`/`FocusView` components near the end of that file). **This should work
as-is when opened in a real browser** — I just never got to verify it end-to-end
since I don't have a network-enabled browser in this environment.

Separately, the user asked me to pull just one pairing (thowd vs. jphn744) directly
in chat, one URL at a time, due to my sandbox's fetch restrictions. I got through
**6 of 96 weeks** (2019 weeks 1-6) before flagging that this was impractically slow
and expensive to do that way, and recommended switching to a real script. That
partial result is preserved in `league_data.json` under `head_to_head_progress` —
treat it as provisional/spot-check data, not something to build on.

**What to do**: write a proper script (Python + `requests`, or Node) that:
- Reads the season chain and `playoff_week_start` per season from `league_data.json`
  (or re-derive it from `GET /v1/league/{id}`)
- Loops all 96 weeks, fetches matchups, groups by `matchup_id`, resolves `roster_id`
  → `owner_id` (via `/rosters` per season) → manager identity (via the mapping table above)
- Builds a full pairwise win-loss(-tie) + points matrix
- Sanity-check the thowd-vs-jphn744 result against the one confirmed data point above
  (2019 week 3: jphn744 won 176.86-116.00) as a smoke test
- Either feed the result into the existing browser grid (it already expects this
  exact shape — `matrix[ownerId][ownerId] = {w,l,t,pf,pa}` — see `buildH2H` in the
  HTML file for the exact structure) or add a new sheet to the Excel workbook

### 2. Excel workbook could use the head-to-head data once it exists

Once #1 is done, a natural addition to `Sunday_Funday_League_History.xlsx` is a
"Head-to-Head" sheet — likely most useful as a matrix (same shape as the in-app
grid) plus maybe a per-manager "toughest opponent" / "favorite opponent" callout
in the League Awards sheet. `build_workbook.py` is structured as a linear script
that builds each sheet in sequence and saves at the end — follow that pattern,
don't refactor unless asked.

### 3. Nothing else was explicitly requested beyond this

Don't add scope (e.g. don't build a "regular season vs playoff" splitter, don't
add trade/waiver tracking) unless the user asks — this league's data sources don't
have that information anyway (ESPN file is season-aggregate only; Sleeper API would
need separate transaction endpoints never pulled here).

## File manifest

```
apps/
  sleeper-draft-warroom.html      — live draft assistant, fully working
  sleeper-league-history.html     — league history + Hall of Fame + head-to-head
                                     (grid builder unverified end-to-end, see above)
data/
  Sunday_Funday_League_History.xlsx  — 6-sheet workbook, 2012-2025, formulas verified
  league_data.json                — full compiled dataset: 162 season-team rows,
                                     manager identity map, league_id chain, PA data,
                                     partial head-to-head progress
scripts/
  build_workbook.py               — regenerates the xlsx from scratch (openpyxl)
```
