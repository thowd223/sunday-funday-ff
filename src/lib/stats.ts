import { SEASONS, MANAGERS, type SeasonRow, type PlayoffResult } from '../data/league'

/** Standard football Pythagorean exponent (used for expected win %). */
const PYTH_EXPONENT = 2.37

export function winPct(w: number, l: number): number {
  return w + l === 0 ? 0 : w / (w + l)
}

/** Pythagorean expected win %: PF^e / (PF^e + PA^e). */
export function pythagoreanWinPct(pf: number, pa: number): number {
  const a = Math.pow(pf, PYTH_EXPONENT)
  const b = Math.pow(pa, PYTH_EXPONENT)
  return a + b === 0 ? 0 : a / (a + b)
}

/** Luck rating: actual win % minus Pythagorean-expected win %. */
export function luckRating(row: SeasonRow): number {
  return winPct(row.w, row.l) - pythagoreanWinPct(row.pf, row.pa)
}

export function madePlayoffs(result: PlayoffResult): boolean {
  return result !== 'Missed Playoffs'
}

export interface CareerStats {
  manager: string
  seasons: number
  wins: number
  losses: number
  winPct: number
  pointsFor: number
  pointsAgainst: number
  pointDiff: number
  championships: number
  runnerUps: number
  thirdPlaces: number
  playoffAppearances: number
  lastPlaceFinishes: number
  avgLuck: number
  bestFinish: PlayoffResult
  firstSeason: number
  lastSeason: number
}

const RESULT_RANK: Record<PlayoffResult, number> = {
  Champion: 6,
  'Runner-Up': 5,
  '3rd Place': 4,
  '4th Place': 3,
  'Made Playoffs': 2,
  'Missed Playoffs': 1,
}

/** Worst regular-season rank present in a given season (its "sacko" slot). */
function lastRankBySeason(): Map<number, number> {
  const m = new Map<number, number>()
  for (const r of SEASONS) {
    m.set(r.season, Math.max(m.get(r.season) ?? 0, r.reg_season_rank))
  }
  return m
}

export function careerStats(manager: string): CareerStats {
  const rows = SEASONS.filter((r) => r.manager === manager)
  const lastRanks = lastRankBySeason()

  let wins = 0
  let losses = 0
  let pointsFor = 0
  let pointsAgainst = 0
  let championships = 0
  let runnerUps = 0
  let thirdPlaces = 0
  let playoffAppearances = 0
  let lastPlaceFinishes = 0
  let luckSum = 0
  let bestResult: PlayoffResult = 'Missed Playoffs'

  for (const r of rows) {
    wins += r.w
    losses += r.l
    pointsFor += r.pf
    pointsAgainst += r.pa
    if (r.result === 'Champion') championships++
    if (r.result === 'Runner-Up') runnerUps++
    if (r.result === '3rd Place') thirdPlaces++
    if (madePlayoffs(r.result)) playoffAppearances++
    if (r.reg_season_rank === lastRanks.get(r.season)) lastPlaceFinishes++
    luckSum += luckRating(r)
    if (RESULT_RANK[r.result] > RESULT_RANK[bestResult]) bestResult = r.result
  }

  const seasonYears = rows.map((r) => r.season)

  return {
    manager,
    seasons: rows.length,
    wins,
    losses,
    winPct: winPct(wins, losses),
    pointsFor,
    pointsAgainst,
    pointDiff: pointsFor - pointsAgainst,
    championships,
    runnerUps,
    thirdPlaces,
    playoffAppearances,
    lastPlaceFinishes,
    avgLuck: rows.length ? luckSum / rows.length : 0,
    bestFinish: bestResult,
    firstSeason: Math.min(...seasonYears),
    lastSeason: Math.max(...seasonYears),
  }
}

export function allCareerStats(): CareerStats[] {
  return MANAGERS.map(careerStats)
}

export interface SeasonPodium {
  season: number
  champion?: string
  runnerUp?: string
  third?: string
  fourth?: string
}

export function seasonPodiums(): SeasonPodium[] {
  const bySeason = new Map<number, SeasonPodium>()
  for (const r of SEASONS) {
    const p = bySeason.get(r.season) ?? { season: r.season }
    if (r.result === 'Champion') p.champion = r.manager
    if (r.result === 'Runner-Up') p.runnerUp = r.manager
    if (r.result === '3rd Place') p.third = r.manager
    if (r.result === '4th Place') p.fourth = r.manager
    bySeason.set(r.season, p)
  }
  return [...bySeason.values()].sort((a, b) => a.season - b.season)
}

/** League-wide roll-ups for the overview page. */
export function leagueTotals() {
  const seasonsPlayed = new Set(SEASONS.map((r) => r.season)).size
  const totalGames = SEASONS.reduce((acc, r) => acc + r.w + r.l, 0) / 2
  const totalPoints = SEASONS.reduce((acc, r) => acc + r.pf, 0)
  const highestSeason = SEASONS.reduce((best, r) => (r.pf > best.pf ? r : best), SEASONS[0])
  return { seasonsPlayed, totalGames, totalPoints, highestSeason }
}
