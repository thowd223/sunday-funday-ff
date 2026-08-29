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
  search, "hide drafted", and tier breaks if your rankings include tiers.
- **Draft Board** — the full round-by-slot grid, snake-aware (including a
  `reversal_round` setting if the draft has one), color-coded by position, with each
  picked player annotated with *your* rank for them. The on-the-clock cell is outlined.
  A Best Available list sits alongside it (position filter, search, hide-drafted) so you
  never have to leave the board to check rankings — its filters are the same ones as the
  Best Available tab, kept in sync whichever one you use.
- **My Team** — your roster so far, your upcoming pick numbers, and a "drafted but not
  in my rankings" list so name mismatches never silently hide a taken player.
- **Rankings / Settings** — input and configuration, both persisted in localStorage.

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

## Reusing for another league

Change the league ID in the Settings tab — that's it. Works for any Sleeper league,
snake or linear draft. Auction drafts fall back to list views (no board grid).
