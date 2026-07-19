import {
  MANAGERS,
  SEASON_YEARS,
  SEASONS,
  playoffBracketFor,
  type BracketGame,
  type GamePhase,
} from '../data/league'
import { pairGames } from './h2h'

/** A single meeting between two managers, from a's perspective. */
export interface RivalryMeeting {
  season: number
  week: number
  phase: GamePhase
  consolation: boolean
  pf: number
  pa: number
  result: 'W' | 'L' | 'T'
  /**
   * True when this meeting was a championship-path playoff game — i.e. a real
   * bracket game (not a toilet-bowl/consolation game, not a 3rd/5th-place
   * placement game). These are the games with a season on the line.
   */
  championshipPath: boolean
  /** Round name ("Quarterfinal", "Semifinal", "Championship", ...) when championshipPath is true. */
  roundLabel: string | null
}

/** A championship-path playoff meeting in which one side ended the other's season. */
export interface RivalryElimination {
  season: number
  week: number
  roundLabel: string
  winner: string
  loser: string
  pfWinner: number
  pfLoser: number
}

export interface RivalryRecord {
  wins: number
  losses: number
  ties: number
}

export interface RivalryStats {
  a: string
  b: string
  /** Every meeting between a and b, chronological (oldest first). */
  meetings: RivalryMeeting[]
  /** All-time record, from a's perspective. */
  allTime: RivalryRecord
  regularSeason: RivalryRecord
  playoff: RivalryRecord
  pointsForA: number
  pointsForB: number
  /** Who has won the last N consecutive meetings (a run broken by a tie resets to null). */
  currentStreak: { manager: string; count: number } | null
  biggestBlowout: RivalryMeeting | null
  closestGame: RivalryMeeting | null
  /** Whether any meeting between the two ended in a tie. */
  hasTies: boolean
  highestScoring: RivalryMeeting | null
  /** Championship-path playoff meetings only, chronological. */
  eliminations: RivalryElimination[]
  eliminationsByA: number
  eliminationsByB: number
}

/** A game with a place decided (other than 1st) doesn't advance anywhere — a placement game. */
function isPlacementGame(place: number | null): boolean {
  return place != null && place !== 1
}

/**
 * True for a championship-path (title-relevant) playoff game: reconciles the two
 * incompatible data shapes described in PlayoffBracket.tsx — ESPN-era games
 * (2012-2018) are tagged with a `tier` string, Sleeper-era games (2019+) carry a
 * numeric `round` instead and no `tier`. In both eras, a game with a `place` other
 * than 1st is a 3rd/5th-place placement game, not a championship-path elimination.
 */
function isChampionshipPathGame(g: BracketGame): boolean {
  if (isPlacementGame(g.place)) return false
  if (g.tier != null) return g.tier === 'WINNERS_BRACKET'
  return g.round != null && !g.consolation
}

interface SeasonRoundIndex {
  isTiered: boolean
  /** Championship-path round keys for the season, ascending (week if tiered, round otherwise). */
  keys: number[]
}

const seasonRoundIndexCache = new Map<number, SeasonRoundIndex>()

/**
 * Builds the ordered list of championship-path "round keys" for a season across
 * every manager who played it, so a single game can be placed into a round
 * (Quarterfinal, Semifinal, Championship, ...). Mirrors the round reconciliation
 * PlayoffBracket.tsx does for the visual bracket, scoped down to just what this
 * page needs: how many rounds there were, and which key maps to which round.
 */
function seasonRoundIndex(season: number): SeasonRoundIndex {
  const cached = seasonRoundIndexCache.get(season)
  if (cached) return cached

  const managers = [...new Set(SEASONS.filter((r) => r.season === season).map((r) => r.manager))]
  const allChampGames: BracketGame[] = []
  for (const m of managers) {
    for (const g of playoffBracketFor(season, m)) {
      if (isChampionshipPathGame(g)) allChampGames.push(g)
    }
  }

  const isTiered = allChampGames.some((g) => g.tier != null)
  const keySet = new Set<number>()
  for (const g of allChampGames) keySet.add(isTiered ? g.week : (g.round as number))

  const index: SeasonRoundIndex = { isTiered, keys: [...keySet].sort((x, y) => x - y) }
  seasonRoundIndexCache.set(season, index)
  return index
}

/** "Quarterfinal" / "Semifinal" / "Championship" / "Round N", by distance from the final round. */
function roundLabelFromIndex(idx: number, totalRounds: number): string {
  const distanceFromFinal = totalRounds - 1 - idx
  if (distanceFromFinal === 0) return 'Championship'
  if (distanceFromFinal === 1) return 'Semifinal'
  if (distanceFromFinal === 2) return 'Quarterfinal'
  return `Round ${idx + 1}`
}

/** Per-season map of week -> human round label, for that manager's championship-path games only. */
function championshipRoundLabelsByWeek(season: number, manager: string): Map<number, string> {
  const { isTiered, keys } = seasonRoundIndex(season)
  const map = new Map<number, string>()
  for (const g of playoffBracketFor(season, manager)) {
    if (!isChampionshipPathGame(g)) continue
    const key = isTiered ? g.week : (g.round as number)
    const idx = keys.indexOf(key)
    if (idx !== -1) map.set(g.week, roundLabelFromIndex(idx, keys.length))
  }
  return map
}

function emptyRecord(): RivalryRecord {
  return { wins: 0, losses: 0, ties: 0 }
}

function applyResult(record: RivalryRecord, result: 'W' | 'L' | 'T') {
  if (result === 'W') record.wins++
  else if (result === 'L') record.losses++
  else record.ties++
}

/**
 * Full rivalry breakdown for a pair of managers, from a's perspective (a's
 * record, a's points listed first). Calling with (b, a) instead of (a, b)
 * mirrors every field consistently — it is not a distinct computation.
 */
export function rivalryStats(a: string, b: string): RivalryStats {
  const rawMeetings = pairGames(a, b, true)

  // Cache the (week -> round label) map per season lazily — most rivalries only
  // ever touch a handful of seasons.
  const roundLabelCache = new Map<number, Map<number, string>>()
  const roundLabelsFor = (season: number) => {
    let map = roundLabelCache.get(season)
    if (!map) {
      map = championshipRoundLabelsByWeek(season, a)
      roundLabelCache.set(season, map)
    }
    return map
  }

  const meetings: RivalryMeeting[] = rawMeetings.map((g) => {
    const roundLabel =
      g.phase === 'playoff' && !g.consolation ? roundLabelsFor(g.season).get(g.week) ?? null : null
    return {
      season: g.season,
      week: g.week,
      phase: g.phase,
      consolation: !!g.consolation,
      pf: g.pf,
      pa: g.pa,
      result: g.result,
      championshipPath: roundLabel != null,
      roundLabel,
    }
  })

  const allTime = emptyRecord()
  const regularSeason = emptyRecord()
  const playoff = emptyRecord()
  let pointsForA = 0
  let pointsForB = 0
  let hasTies = false

  let biggestBlowout: RivalryMeeting | null = null
  let closestGame: RivalryMeeting | null = null
  let highestScoring: RivalryMeeting | null = null

  for (const m of meetings) {
    applyResult(allTime, m.result)
    applyResult(m.phase === 'regular' ? regularSeason : playoff, m.result)
    pointsForA += m.pf
    pointsForB += m.pa
    if (m.result === 'T') hasTies = true

    const margin = Math.abs(m.pf - m.pa)
    if (!biggestBlowout || margin > Math.abs(biggestBlowout.pf - biggestBlowout.pa)) {
      biggestBlowout = m
    }
    if (margin > 0 && (!closestGame || margin < Math.abs(closestGame.pf - closestGame.pa))) {
      closestGame = m
    }
    const total = m.pf + m.pa
    if (!highestScoring || total > highestScoring.pf + highestScoring.pa) {
      highestScoring = m
    }
  }

  // Current streak: consecutive wins by one side ending at the most recent
  // meeting. A tie breaks any streak (and itself starts nothing).
  let currentStreak: { manager: string; count: number } | null = null
  if (meetings.length > 0) {
    const last = meetings[meetings.length - 1]
    if (last.result !== 'T') {
      const winner = last.result === 'W' ? a : b
      let count = 0
      for (let i = meetings.length - 1; i >= 0; i--) {
        const m = meetings[i]
        if (m.result === 'T') break
        const w = m.result === 'W' ? a : b
        if (w !== winner) break
        count++
      }
      currentStreak = { manager: winner, count }
    }
  }

  const eliminations: RivalryElimination[] = meetings
    .filter((m) => m.championshipPath && m.result !== 'T')
    .map((m) => ({
      season: m.season,
      week: m.week,
      roundLabel: m.roundLabel as string,
      winner: m.result === 'W' ? a : b,
      loser: m.result === 'W' ? b : a,
      pfWinner: m.result === 'W' ? m.pf : m.pa,
      pfLoser: m.result === 'W' ? m.pa : m.pf,
    }))

  return {
    a,
    b,
    meetings,
    allTime,
    regularSeason,
    playoff,
    pointsForA,
    pointsForB,
    currentStreak,
    biggestBlowout,
    closestGame,
    hasTies,
    highestScoring,
    eliminations,
    eliminationsByA: eliminations.filter((e) => e.winner === a).length,
    eliminationsByB: eliminations.filter((e) => e.winner === b).length,
  }
}

export interface RankedRivalry {
  stats: RivalryStats
  heat: number
}

/** A pair needs at least this many all-time meetings to qualify as a ranked "rivalry". */
const MIN_RANKED_MEETINGS = 6

/** A pair counts as "still active" if they've met within this many most-recent seasons. */
const RECENT_SEASON_WINDOW = 2

/**
 * League-wide rivalry "heat" score, 0-100, for a qualifying pair (>= MIN_RANKED_MEETINGS
 * all-time meetings). Built from five ingredients, each normalized to [0, 1] and
 * blended with weights that sum to 1 — playoff stakes are deliberately the single
 * biggest factor, since two teams that have actually eliminated each other feel
 * like a much bigger rivalry than two teams that have only traded regular-season
 * wins:
 *
 *   - history      (25%): min(meetings / 12, 1) — more games played, saturating
 *                          around "met every year of a 12-season stretch."
 *   - closeness    (20%): 1 - |winPctA - 0.5| * 2 — a coin-flip series scores 1,
 *                          a one-sided series scores toward 0.
 *   - playoffs     (30%): min(playoff meetings / 3, 1) — a meeting with a bracket
 *                          spot on the line is rarer and weighted heavily.
 *   - eliminations (15%): min(eliminations / 2, 1) — knocking the other side out
 *                          of the playoffs is the marquee rivalry moment.
 *   - recency      (10%): 1 if they've met in the last RECENT_SEASON_WINDOW
 *                          seasons, else 0 — keeps dormant old rivalries from
 *                          outranking series that are still being played out.
 */
function heatScore(stats: RivalryStats): number {
  const n = stats.allTime.wins + stats.allTime.losses + stats.allTime.ties
  const history = Math.min(n / 12, 1)

  const winPctA = n === 0 ? 0.5 : (stats.allTime.wins + stats.allTime.ties * 0.5) / n
  const closeness = 1 - Math.abs(winPctA - 0.5) * 2

  const playoffMeetings = stats.playoff.wins + stats.playoff.losses + stats.playoff.ties
  const playoffs = Math.min(playoffMeetings / 3, 1)

  const eliminationsScore = Math.min(stats.eliminations.length / 2, 1)

  const lastSeason = stats.meetings.length > 0 ? stats.meetings[stats.meetings.length - 1].season : null
  const mostRecentLeagueSeason = SEASON_YEARS[SEASON_YEARS.length - 1]
  const recency =
    lastSeason != null && mostRecentLeagueSeason - lastSeason < RECENT_SEASON_WINDOW ? 1 : 0

  return (
    100 *
    (history * 0.25 + closeness * 0.2 + playoffs * 0.3 + eliminationsScore * 0.15 + recency * 0.1)
  )
}

/**
 * Every qualifying rivalry (>= MIN_RANKED_MEETINGS all-time meetings) across the
 * league, ranked by heat score, hottest first.
 */
export function rankRivalries(): RankedRivalry[] {
  const ranked: RankedRivalry[] = []
  for (let i = 0; i < MANAGERS.length; i++) {
    for (let j = i + 1; j < MANAGERS.length; j++) {
      const stats = rivalryStats(MANAGERS[i], MANAGERS[j])
      const total = stats.allTime.wins + stats.allTime.losses + stats.allTime.ties
      if (total < MIN_RANKED_MEETINGS) continue
      ranked.push({ stats, heat: heatScore(stats) })
    }
  }
  return ranked.sort((x, y) => y.heat - x.heat)
}
