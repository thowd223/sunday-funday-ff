# Draft Day tool

A standalone draft-day companion for the Sunday Funday league — the same idea as the
SFB16 draft tracker: you bring your own rankings, and on every manual **Refresh** it
pulls the live draft from Sleeper and crosses off who's gone.

It is deliberately **not** part of the deployed league site. It's one self-contained
HTML file with zero dependencies and no build step — you just open it.

## Running it

```bash
# easiest: open the file directly in a browser
open draft-tool/index.html            # macOS
start draft-tool\index.html           # Windows

# if your browser blocks the Sleeper API calls from a file:// page, serve it instead:
npx serve draft-tool
```

The only network traffic is read-only GETs to `api.sleeper.app` when you hit Refresh.
Your rankings never leave the browser — everything is kept in localStorage.

### On your phone

Works the same way — get `index.html` onto the phone (AirDrop/share the file, or a
cloud-drive/GitHub link) and open it from your phone's browser or Files app; no app
install, no server. The layout is responsive: the tab bar wraps, the board and its
best-available sidebar stack instead of sitting side by side, Settings goes to a single
column, and both the rankings table and the board grid scroll horizontally within
themselves so nothing gets clipped. If you're using `npx serve` instead of opening the
file directly, your phone needs to be on the same network as the machine running it.

## Draft-day flow

It ships with rankings already loaded (a 332-player half-PPR seasonal set, `rankings.csv`
in this folder, embedded directly into `index.html` so it works with no server) — open
it and Best Available is populated immediately, no setup step required.

1. **Rankings tab** — to use different rankings, paste new ones (or upload a
   `.csv`/`.txt` file) and hit *Apply rankings* — this replaces the shipped default and
   is remembered in your browser going forward. The parser is deliberately forgiving:
   - full CSV/TSV with headers (`rank`, `tier`, `player`/`name`/`full name`, `pos`,
     `team`/`team abbrev` in any order — matching your ranking source's usual export
     columns),
   - or plain lines like `1. Ja'Marr Chase WR CIN`,
   - or just one player name per line (rank = row order).
   Tiers, positions, and teams are all optional.
2. **Settings tab** — either paste a **draft link or ID** (works for mock drafts, and
   any other draft not tied to your usual league), or leave that blank and use the
   **league ID** instead (the 2026 Sunday Funday league, `1313676998056378368`, is
   prefilled — it auto-picks that league's latest draft). Pick which team is *you*
   (used for "picks until yours", your column highlight, and the My Team tab).
3. Hit **Refresh** whenever you want to sync — after every pick, or whenever. Nothing
   polls in the background; it only talks to Sleeper when you click.

### Mock drafts

Paste the draft's URL straight from your browser, e.g.
`https://sleeper.com/beta/draft/nfl/1399261781234364416` — any shape of Sleeper draft
link works, or just the numeric ID on its own. Mock drafts aren't tied to a real league,
so team names come from Sleeper's public per-user profile lookup instead of a league's
roster list: your own name resolves correctly, but Sleeper's AI-filled bot opponents
have synthetic IDs that don't resolve to a name, so they just show as "Slot N" — picks
and matching still work identically either way.

## What each tab shows

- **Best Available** — your rankings in your order, drafted players struck through with
  who took them and at what pick (your own picks highlighted green). Position filter,
  search, "hide drafted", and tier breaks if your rankings include tiers. Each row shows
  the overall rank plus a positional rank next to the position badge (read from the
  rankings' own `Positional Rank` column when present, counted off per position
  otherwise).

  **Tiers**: if your rankings carry an explicit `tier` column, those are used as-is
  (overall tiers, break lines in the ALL view). Otherwise, when a `Projected Fantasy
  Points` column exists — the shipped rankings have one — per-position tiers are
  *derived* from the natural cliffs in projected points: a new tier starts when a
  player's projection falls at least max(15 pts, 7% of the tier's best projection)
  below that best, and players under 45% of their position's top projection stay
  untiered (the deep tail declines continuously; tiers there would be noise). Those
  constants were calibrated by eye against the shipped 2026 projections (Josh Allen
  alone in QB T1; Gibbs+Bijan as RB T1 with CMC his own T2). Derived tiers show as a
  `T#` chip per row, with break lines when you filter to a single position.
- **Draft Board** — the full round-by-slot grid, snake-aware (including a
  `reversal_round` setting if the draft has one), color-coded by position, with each
  picked player annotated with *your* rank for them. The on-the-clock cell is outlined.
  A Best Available list sits alongside it (position filter, search, hide-drafted) so you
  never have to leave the board to check rankings — its filters are the same ones as the
  Best Available tab, kept in sync whichever one you use.
- **My Team** — your roster so far, your upcoming pick numbers, and a "drafted but not
  in my rankings" list so name mismatches never silently hide a taken player.
- **Rankings / Settings** — input and configuration, both persisted in localStorage.

## ADP and "will they be there?" predictions

The shipped rankings have real Sleeper half-PPR ADP merged in for 224 of the 332
players (skill positions — kickers/DSTs and deep bench players aren't in Sleeper's ADP
data at all, so those show "—"). Sleeper doesn't expose ADP through its API, documented
or otherwise — this was pulled by hand from Sleeper's own ADP page and matched into
`rankings.csv` by player name; see the `adp` column there for provenance if you ever
need to redo it.

Once ADP is present and you've set **I am** in Settings, Best Available adds an
**At your pick** column: **Likely Gone** / **Toss-Up** / **Likely There**, comparing
each undrafted player's ADP against your actual next pick number (recomputed live as
picks come in). This is a heuristic, not a real probability model — Sleeper doesn't
publish per-player variance, so the tool uses a margin that widens proportionally with
ADP (10%, floor of 2 picks) as a stand-in for "ADP gets noisier the deeper you go." The
board sidebar shows the same call as a compact badge (G / ? / ✓).

If you paste your own rankings with a populated `ADP` column (exact header match —
`ADP Trend` and similar are ignored), the same prediction activates automatically for
those; no ADP column just means the feature quietly doesn't show, same as any other
rankings source that doesn't carry it.

## Name matching

Picks are matched to your rankings by normalized name (case, punctuation, and
Jr/Sr/II/III/IV suffixes ignored). If your row has a position and it disagrees with
Sleeper's, the match is rejected (two different players can share a name). Anything
that doesn't match shows up in the My Team tab's mismatch panel — and you can click any
player's name in Best Available to manually mark them drafted (remembered per draft).

## Updating the shipped rankings

`rankings.csv` is kept in the repo as a readable record of what's currently embedded —
it isn't read at runtime (opening the tool as a local file can't fetch a sibling file
in most browsers), so editing it alone won't change the app. To update the shipped
default: paste your new rankings into the Rankings tab (that's enough for your own
browser — it persists in localStorage), and if you also want the file that ships to a
fresh browser/computer updated, ask Claude to re-embed the new CSV into `index.html` and
replace `rankings.csv` to match.

**Whatever's pasted/saved in your browser always wins over the shipped default** —
that's what makes your own edits stick between visits, but it also means pulling a code
update (e.g. a newer ADP pull) won't actually show up for you until you clear that
override. Hit **Reset to shipped default** on the Rankings tab to drop back to whatever
this version of the tool ships with.

## Reusing for another league

Change the league ID in the Settings tab — that's it. Works for any Sleeper league,
snake or linear draft. Auction drafts fall back to list views (no board grid).
