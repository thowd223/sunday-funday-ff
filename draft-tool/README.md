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

## Draft-day flow

1. **Rankings tab** — paste your rankings (or upload a `.csv`/`.txt` file) and hit
   *Apply rankings*. The parser is deliberately forgiving:
   - full CSV/TSV with headers (`rank`, `tier`, `player`/`name`, `pos`, `team` in any order),
   - or plain lines like `1. Ja'Marr Chase WR CIN`,
   - or just one player name per line (rank = row order).
   Tiers, positions, and teams are all optional. See `sample-rankings.csv`.
2. **Settings tab** — the 2026 Sunday Funday league ID (`1313676998056378368`) is
   prefilled; pick which team is *you* (used for "picks until yours", your column
   highlight, and the My Team tab). The latest draft is auto-selected on first refresh.
3. Hit **Refresh** whenever you want to sync — after every pick, or whenever. Nothing
   polls in the background; it only talks to Sleeper when you click.

## What each tab shows

- **Best Available** — your rankings in your order, drafted players struck through with
  who took them and at what pick (your own picks highlighted green). Position filter,
  search, "hide drafted", and tier breaks if your rankings include tiers.
- **Draft Board** — the full round-by-slot grid, snake-aware (including a
  `reversal_round` setting if the draft has one), color-coded by position, with each
  picked player annotated with *your* rank for them. The on-the-clock cell is outlined.
- **My Team** — your roster so far, your upcoming pick numbers, and a "drafted but not
  in my rankings" list so name mismatches never silently hide a taken player.
- **Rankings / Settings** — input and configuration, both persisted in localStorage.

## Name matching

Picks are matched to your rankings by normalized name (case, punctuation, and
Jr/Sr/II/III/IV suffixes ignored). If your row has a position and it disagrees with
Sleeper's, the match is rejected (two different players can share a name). Anything
that doesn't match shows up in the My Team tab's mismatch panel — and you can click any
player's name in Best Available to manually mark them drafted (remembered per draft).

## Reusing for another league

Change the league ID in the Settings tab — that's it. Works for any Sleeper league,
snake or linear draft. Auction drafts fall back to list views (no board grid).
