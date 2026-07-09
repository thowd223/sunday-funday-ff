import { MATCHUP_LOG, type MatchupGame } from '../data/league'

export interface H2HCell {
  w: number
  l: number
  t: number
  pf: number
  pa: number
}

export type H2HMatrix = Record<string, Record<string, H2HCell>>

/**
 * All-time pairwise head-to-head matrix, built from the full bundled game log
 * (2012-2025, both ESPN and Sleeper eras, regular season + playoffs).
 */
export function buildHeadToHead(includePlayoffs = true): H2HMatrix {
  const matrix: H2HMatrix = {}
  const ensure = (a: string, b: string): H2HCell => {
    matrix[a] ??= {}
    matrix[a][b] ??= { w: 0, l: 0, t: 0, pf: 0, pa: 0 }
    return matrix[a][b]
  }

  for (const g of MATCHUP_LOG) {
    if (!includePlayoffs && g.phase === 'playoff') continue
    const cell = ensure(g.manager, g.opponent)
    if (g.result === 'W') cell.w++
    else if (g.result === 'L') cell.l++
    else cell.t++
    cell.pf += g.pf
    cell.pa += g.pa
  }

  return matrix
}

/**
 * Every meeting between two managers, from a's perspective, sorted oldest to
 * newest. MATCHUP_LOG has one row per manager per real game, so filtering on
 * manager===a && opponent===b gives each meeting exactly once.
 */
export function pairGames(a: string, b: string, includePlayoffs: boolean): MatchupGame[] {
  return MATCHUP_LOG.filter(
    (g) => g.manager === a && g.opponent === b && (includePlayoffs || g.phase !== 'playoff'),
  ).sort((x, y) => x.season - y.season || x.week - y.week)
}

export interface RivalryOpponent {
  opponent: string
  w: number
  l: number
  t: number
}

export interface Rivalry {
  toughest: RivalryOpponent | null
  favorite: RivalryOpponent | null
}

// Require at least this many meetings before an opponent counts as a "rivalry" —
// otherwise a single early loss/win would dominate the ranking.
const MIN_GAMES = 3

/**
 * A manager's best and worst all-time matchups by win%, among opponents they've
 * faced at least MIN_GAMES times.
 */
export function rivalryFor(manager: string): Rivalry {
  const cells: Record<string, Pick<H2HCell, 'w' | 'l' | 't'>> = {}
  for (const g of MATCHUP_LOG) {
    if (g.manager !== manager) continue
    cells[g.opponent] ??= { w: 0, l: 0, t: 0 }
    const cell = cells[g.opponent]
    if (g.result === 'W') cell.w++
    else if (g.result === 'L') cell.l++
    else cell.t++
  }

  const qualified = Object.entries(cells)
    .map(([opponent, cell]) => ({ opponent, ...cell, games: cell.w + cell.l + cell.t }))
    .filter((o) => o.games >= MIN_GAMES)

  if (qualified.length === 0) return { toughest: null, favorite: null }

  const winPctOf = (o: { w: number; l: number; t: number; games: number }) =>
    (o.w + o.t * 0.5) / o.games

  const toughest = qualified.reduce((a, b) => (winPctOf(b) < winPctOf(a) ? b : a))
  const favorite = qualified.reduce((a, b) => (winPctOf(b) > winPctOf(a) ? b : a))

  return {
    toughest: { opponent: toughest.opponent, w: toughest.w, l: toughest.l, t: toughest.t },
    favorite: { opponent: favorite.opponent, w: favorite.w, l: favorite.l, t: favorite.t },
  }
}
