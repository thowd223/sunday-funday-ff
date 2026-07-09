import { MATCHUP_LOG, SEASONS, type GamePhase, type MatchupGame, type SeasonRow } from '../data/league'
import { luckRating } from './stats'

const MIN_RIVALRY_GAMES = 10

export interface SeasonHighlight {
  manager: string
  season: number
  value: number
}

export interface StreakRecord {
  manager: string
  length: number
  season: number
  startWeek: number
  endWeek: number
}

export interface RivalryRecord {
  manager: string
  opponent: string
  wins: number
  losses: number
  ties: number
  winPct: number
}

export interface ActiveStreakRecord {
  manager: string
  opponent: string
  length: number
  lastSeason: number
}

export interface BlowoutRecord {
  winner: string
  loser: string
  winnerScore: number
  loserScore: number
  margin: number
  season: number
  week: number
  phase: GamePhase
}

export interface SingleGameRecord {
  manager: string
  points: number
  opponent: string
  season: number
  week: number
  phase: GamePhase
}

export interface RecordsData {
  highestSeasonPF: SeasonHighlight
  lowestSeasonPF: SeasonHighlight
  bestSeasonPointDiff: SeasonHighlight
  worstSeasonPointDiff: SeasonHighlight
  luckiestSeason: SeasonHighlight
  unluckiestSeason: SeasonHighlight
  longestWinStreak: StreakRecord
  longestLossStreak: StreakRecord
  mostLopsidedRivalry: RivalryRecord
  longestActiveH2HStreak: ActiveStreakRecord
  biggestBlowout: BlowoutRecord
  closestGame: BlowoutRecord
  tiedScoreGames: number
  highestSingleGame: SingleGameRecord
  lowestSingleGame: SingleGameRecord
}

function bestBy(rows: SeasonRow[], value: (r: SeasonRow) => number, dir: 'max' | 'min'): SeasonRow {
  return rows.reduce((best, r) =>
    dir === 'max' ? (value(r) > value(best) ? r : best) : value(r) < value(best) ? r : best,
  )
}

/**
 * Chronological order within a season: regular season weeks first, then playoff weeks.
 * Used so win/loss streaks read in the order the games were actually played.
 */
function phaseRank(g: MatchupGame): number {
  return g.phase === 'regular' ? 0 : 1
}

function chronologicalGames(games: MatchupGame[]): MatchupGame[] {
  return [...games].sort(
    (a, b) => a.season - b.season || phaseRank(a) - phaseRank(b) || a.week - b.week,
  )
}

/**
 * Longest streak of a given result, league-wide. Streaks are reset at season
 * boundaries — a hot streak carrying a manager from the regular season into their
 * own playoffs still counts, but we don't stitch one season's finale to the next
 * season's opener together, since those are effectively unrelated stretches of a
 * manager's career separated by an offseason (roster turnover, re-drafts, etc.).
 */
function longestStreak(result: 'W' | 'L'): StreakRecord {
  const managers = [...new Set(MATCHUP_LOG.map((g) => g.manager))]
  let best: StreakRecord | undefined

  for (const manager of managers) {
    const games = chronologicalGames(MATCHUP_LOG.filter((g) => g.manager === manager))
    let run: MatchupGame[] = []

    const flush = () => {
      if (run.length > 0 && (!best || run.length > best.length)) {
        best = {
          manager,
          length: run.length,
          season: run[0].season,
          startWeek: run[0].week,
          endWeek: run[run.length - 1].week,
        }
      }
      run = []
    }

    for (const g of games) {
      const continuesRun = run.length > 0 && run[run.length - 1].season === g.season
      if (g.result === result && (run.length === 0 || continuesRun)) {
        run.push(g)
      } else if (g.result === result) {
        flush()
        run.push(g)
      } else {
        flush()
      }
    }
    flush()
  }

  if (!best) throw new Error(`No ${result} streak found`)
  return best
}

/** All-time win/loss/tie totals for every manager pair, from the full game log. */
function headToHeadTotals(): RivalryRecord[] {
  const totals = new Map<string, { manager: string; opponent: string; w: number; l: number; t: number }>()

  for (const g of MATCHUP_LOG) {
    const key = `${g.manager}|${g.opponent}`
    const cell = totals.get(key) ?? { manager: g.manager, opponent: g.opponent, w: 0, l: 0, t: 0 }
    if (g.result === 'W') cell.w++
    else if (g.result === 'L') cell.l++
    else cell.t++
    totals.set(key, cell)
  }

  return [...totals.values()].map((c) => ({
    manager: c.manager,
    opponent: c.opponent,
    wins: c.w,
    losses: c.l,
    ties: c.t,
    winPct: c.w + c.l === 0 ? 0 : c.w / (c.w + c.l),
  }))
}

/** Biggest all-time win% gap between two managers, minimum games threshold applied. */
function mostLopsidedRivalry(): RivalryRecord {
  const candidates = headToHeadTotals().filter(
    (r) => r.wins + r.losses + r.ties >= MIN_RIVALRY_GAMES,
  )
  return candidates.reduce((best, r) =>
    Math.abs(r.winPct - 0.5) > Math.abs(best.winPct - 0.5) ? r : best,
  )
}

/** Longest ongoing (i.e. most recent, unbroken through the last meeting) H2H win streak. */
function longestActiveH2HStreak(): ActiveStreakRecord {
  const pairs = new Map<string, MatchupGame[]>()
  for (const g of MATCHUP_LOG) {
    const key = `${g.manager}|${g.opponent}`
    const arr = pairs.get(key) ?? []
    arr.push(g)
    pairs.set(key, arr)
  }

  let best: ActiveStreakRecord | undefined

  for (const [key, games] of pairs) {
    const [manager, opponent] = key.split('|')
    const sorted = chronologicalGames(games)
    let length = 0
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i].result !== 'W') break
      length++
    }
    if (length > 0 && (!best || length > best.length)) {
      best = { manager, opponent, length, lastSeason: sorted[sorted.length - 1].season }
    }
  }

  if (!best) throw new Error('No active H2H streak found')
  return best
}

/**
 * Every real game appears twice in MATCHUP_LOG (once per side), so we only look at
 * the entry where `manager < opponent` alphabetically — that picks exactly one of
 * the two rows per game, regardless of who won, without needing a separate identity
 * for each matchup. (This is just a stable way to pick one side per pair — it doesn't
 * matter which side "wins" the comparison, only that exactly one of the two rows for
 * a given game passes the filter.)
 */
function uniqueGames(): MatchupGame[] {
  return MATCHUP_LOG.filter((g) => g.manager < g.opponent)
}

/**
 * A couple of real games in league history ended with pf === pa (an exact score
 * tie); the league's tiebreak rule still recorded a W/L for those, so they don't
 * show up as `result: 'T'` anywhere in the log. We surface the count so "closest
 * game" can note that true ties exist above the smallest nonzero margin.
 */
function tiedScoreGameCount(): number {
  return uniqueGames().filter((g) => g.pf === g.pa).length
}

function biggestBlowout(): BlowoutRecord {
  const best = uniqueGames().reduce((best, g) => {
    const margin = Math.abs(g.pf - g.pa)
    return margin > best.margin ? { game: g, margin } : best
  }, { game: uniqueGames()[0], margin: -1 })

  const g = best.game
  const winnerIsManager = g.pf >= g.pa
  return {
    winner: winnerIsManager ? g.manager : g.opponent,
    loser: winnerIsManager ? g.opponent : g.manager,
    winnerScore: winnerIsManager ? g.pf : g.pa,
    loserScore: winnerIsManager ? g.pa : g.pf,
    margin: best.margin,
    season: g.season,
    week: g.week,
    phase: g.phase,
  }
}

function closestGame(): BlowoutRecord {
  const nonzero = uniqueGames().filter((g) => g.pf !== g.pa)
  const best = nonzero.reduce((best, g) => {
    const margin = Math.abs(g.pf - g.pa)
    return margin < best.margin ? { game: g, margin } : best
  }, { game: nonzero[0], margin: Math.abs(nonzero[0].pf - nonzero[0].pa) })

  const g = best.game
  const winnerIsManager = g.pf >= g.pa
  return {
    winner: winnerIsManager ? g.manager : g.opponent,
    loser: winnerIsManager ? g.opponent : g.manager,
    winnerScore: winnerIsManager ? g.pf : g.pa,
    loserScore: winnerIsManager ? g.pa : g.pf,
    margin: best.margin,
    season: g.season,
    week: g.week,
    phase: g.phase,
  }
}

function extremeSingleGame(dir: 'max' | 'min'): SingleGameRecord {
  const best = MATCHUP_LOG.reduce((best, g) =>
    dir === 'max' ? (g.pf > best.pf ? g : best) : g.pf < best.pf ? g : best,
  )
  return {
    manager: best.manager,
    points: best.pf,
    opponent: best.opponent,
    season: best.season,
    week: best.week,
    phase: best.phase,
  }
}

export function buildRecords(): RecordsData {
  const highestPF = bestBy(SEASONS, (r) => r.pf, 'max')
  const lowestPF = bestBy(SEASONS, (r) => r.pf, 'min')
  const bestDiff = bestBy(SEASONS, (r) => r.pf - r.pa, 'max')
  const worstDiff = bestBy(SEASONS, (r) => r.pf - r.pa, 'min')
  const luckiest = bestBy(SEASONS, (r) => luckRating(r), 'max')
  const unluckiest = bestBy(SEASONS, (r) => luckRating(r), 'min')

  return {
    highestSeasonPF: { manager: highestPF.manager, season: highestPF.season, value: highestPF.pf },
    lowestSeasonPF: { manager: lowestPF.manager, season: lowestPF.season, value: lowestPF.pf },
    bestSeasonPointDiff: {
      manager: bestDiff.manager,
      season: bestDiff.season,
      value: bestDiff.pf - bestDiff.pa,
    },
    worstSeasonPointDiff: {
      manager: worstDiff.manager,
      season: worstDiff.season,
      value: worstDiff.pf - worstDiff.pa,
    },
    luckiestSeason: { manager: luckiest.manager, season: luckiest.season, value: luckRating(luckiest) },
    unluckiestSeason: {
      manager: unluckiest.manager,
      season: unluckiest.season,
      value: luckRating(unluckiest),
    },
    longestWinStreak: longestStreak('W'),
    longestLossStreak: longestStreak('L'),
    mostLopsidedRivalry: mostLopsidedRivalry(),
    longestActiveH2HStreak: longestActiveH2HStreak(),
    biggestBlowout: biggestBlowout(),
    closestGame: closestGame(),
    tiedScoreGames: tiedScoreGameCount(),
    highestSingleGame: extremeSingleGame('max'),
    lowestSingleGame: extremeSingleGame('min'),
  }
}
