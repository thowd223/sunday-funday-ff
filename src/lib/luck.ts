import {
  MATCHUP_LOG,
  SEASONS,
  MANAGERS,
  SEASON_YEARS,
  playoffFieldSize,
  type MatchupGame,
  type PlayoffResult,
} from '../data/league'

/**
 * "All-play" record: how a manager would have fared in a given week/season/career
 * if they'd played every other manager who scored that week, rather than just the
 * one opponent the schedule handed them. Regular season only — playoff weeks don't
 * have a consistent field of simultaneous scores across the whole league, so they're
 * excluded from every calculation in this module.
 */
export interface AllPlayRecord {
  w: number
  l: number
  t: number
}

function allPlayGames(r: AllPlayRecord): number {
  return r.w + r.l + r.t
}

/** All-play win % (ties count as half a win), 0 for an empty record. */
export function allPlayWinPct(r: AllPlayRecord): number {
  const g = allPlayGames(r)
  return g === 0 ? 0 : (r.w + r.t * 0.5) / g
}

interface WeekScore {
  manager: string
  pf: number
}

/**
 * Regular-season scores grouped by season+week. MATCHUP_LOG carries one row per
 * manager per game, so collecting every row for a given season+week yields each
 * manager's own score exactly once — no de-duplication needed. Early seasons (2012)
 * have weeks where fewer managers have a recorded game than others (the league grew
 * mid-season); that's real and each week's all-play field is simply whoever scored
 * that week, so no special-casing is required beyond not assuming a fixed roster size.
 */
function regularSeasonWeeks(): Map<string, WeekScore[]> {
  const map = new Map<string, WeekScore[]>()
  for (const g of MATCHUP_LOG) {
    if (g.phase !== 'regular') continue
    const key = `${g.season}|${g.week}`
    const arr = map.get(key)
    if (arr) arr.push({ manager: g.manager, pf: g.pf })
    else map.set(key, [{ manager: g.manager, pf: g.pf }])
  }
  return map
}

interface AllPlayWeekRow extends AllPlayRecord {
  season: number
  week: number
  manager: string
}

/**
 * Per-manager, per-week all-play result: how many of the *other* managers who
 * scored that week they outscored (w), lost to (l), or tied (t). A week with only
 * one scorer (shouldn't happen, but guarded) simply yields 0-0-0 for that manager.
 */
function computeAllPlayByWeek(): AllPlayWeekRow[] {
  const rows: AllPlayWeekRow[] = []
  for (const [key, scores] of regularSeasonWeeks()) {
    const [seasonStr, weekStr] = key.split('|')
    const season = Number(seasonStr)
    const week = Number(weekStr)
    for (const { manager, pf } of scores) {
      let w = 0
      let l = 0
      let t = 0
      for (const other of scores) {
        if (other.manager === manager) continue
        if (pf > other.pf) w++
        else if (pf < other.pf) l++
        else t++
      }
      rows.push({ season, week, manager, w, l, t })
    }
  }
  return rows
}

export interface ManagerSeasonLuck {
  manager: string
  season: number
  /** Actual regular-season record (from SEASONS — already regular-season-only). */
  actualW: number
  actualL: number
  /** Games actually played this season (actualW + actualL). */
  games: number
  /** All-play record, summed across every regular-season week of this season. */
  allPlay: AllPlayRecord
  allPlayWinPct: number
  /** All-play win % × games played — the win total the schedule "owed" this manager. */
  expectedWins: number
  /** actualW − expectedWins. Positive = lucky (won more than the scoring deserved). */
  luck: number
  result: PlayoffResult
}

/** Every manager-season's all-play record and derived Luck Index. */
export function luckBySeason(): ManagerSeasonLuck[] {
  const weekRows = computeAllPlayByWeek()
  const bySeasonManager = new Map<string, AllPlayRecord>()
  for (const r of weekRows) {
    const key = `${r.season}|${r.manager}`
    const cell = bySeasonManager.get(key) ?? { w: 0, l: 0, t: 0 }
    cell.w += r.w
    cell.l += r.l
    cell.t += r.t
    bySeasonManager.set(key, cell)
  }

  return SEASONS.map((row) => {
    const allPlay = bySeasonManager.get(`${row.season}|${row.manager}`) ?? { w: 0, l: 0, t: 0 }
    const games = row.w + row.l
    const winPct = allPlayWinPct(allPlay)
    const expectedWins = winPct * games
    return {
      manager: row.manager,
      season: row.season,
      actualW: row.w,
      actualL: row.l,
      games,
      allPlay,
      allPlayWinPct: winPct,
      expectedWins,
      luck: row.w - expectedWins,
      result: row.result,
    }
  })
}

export interface CareerLuck {
  manager: string
  seasons: number
  actualW: number
  actualL: number
  games: number
  allPlay: AllPlayRecord
  allPlayWinPct: number
  expectedWins: number
  /** Sum of each season's (actualW − expectedWins) — actual wins minus what the
   *  schedule owed, season by season. Summing per-season luck (rather than pooling
   *  all-play totals across a career and multiplying once) respects that field size
   *  and league strength varied year to year. */
  luck: number
}

/** Career-long Luck Index for every manager, sorted luckiest to unluckiest. */
export function careerLuck(): CareerLuck[] {
  const seasonRows = luckBySeason()
  return MANAGERS.map((manager) => {
    const rows = seasonRows.filter((r) => r.manager === manager)
    const allPlay = rows.reduce<AllPlayRecord>(
      (acc, r) => ({ w: acc.w + r.allPlay.w, l: acc.l + r.allPlay.l, t: acc.t + r.allPlay.t }),
      { w: 0, l: 0, t: 0 },
    )
    const actualW = rows.reduce((a, r) => a + r.actualW, 0)
    const actualL = rows.reduce((a, r) => a + r.actualL, 0)
    const games = rows.reduce((a, r) => a + r.games, 0)
    const expectedWins = rows.reduce((a, r) => a + r.expectedWins, 0)
    const luck = rows.reduce((a, r) => a + r.luck, 0)
    return {
      manager,
      seasons: rows.length,
      actualW,
      actualL,
      games,
      allPlay,
      allPlayWinPct: allPlayWinPct(allPlay),
      expectedWins,
      luck,
    }
  }).sort((a, b) => b.luck - a.luck)
}

export interface NotableGame {
  season: number
  week: number
  manager: string
  opponent: string
  pf: number
  pa: number
}

function toNotableGame(g: MatchupGame): NotableGame {
  return { season: g.season, week: g.week, manager: g.manager, opponent: g.opponent, pf: g.pf, pa: g.pa }
}

/**
 * The unluckiest losses in league history: regular-season games where a manager
 * still lost despite posting one of the highest scores anyone has ever lost with.
 * Sorted highest-scoring loss first.
 */
export function unluckiestLosses(limit = 10): NotableGame[] {
  return MATCHUP_LOG.filter((g) => g.phase === 'regular' && g.result === 'L')
    .sort((a, b) => b.pf - a.pf)
    .slice(0, limit)
    .map(toNotableGame)
}

/**
 * The biggest steals in league history: regular-season games won with one of the
 * lowest winning scores ever recorded. Sorted lowest-scoring win first.
 */
export function biggestSteals(limit = 10): NotableGame[] {
  return MATCHUP_LOG.filter((g) => g.phase === 'regular' && g.result === 'W')
    .sort((a, b) => a.pf - b.pf)
    .slice(0, limit)
    .map(toNotableGame)
}

export interface PlayoffSnub {
  manager: string
  season: number
  allPlayWinPct: number
  allPlayRank: number
  fieldSize: number
  regSeasonRank: number
  result: PlayoffResult
}

/**
 * Manager-seasons that "should have" made the playoffs by all-play win % (i.e. they
 * ranked inside that season's playoff field by scoring performance) but actually
 * missed the postseason on the real standings — bad-schedule-luck snubs.
 */
export function playoffSnubs(): PlayoffSnub[] {
  const seasonRows = luckBySeason()
  const snubs: PlayoffSnub[] = []

  for (const season of SEASON_YEARS) {
    const fieldSize = playoffFieldSize(season)
    const rows = seasonRows
      .filter((r) => r.season === season)
      .sort((a, b) => b.allPlayWinPct - a.allPlayWinPct)

    rows.forEach((r, i) => {
      const allPlayRank = i + 1
      if (allPlayRank > fieldSize || r.result !== 'Missed Playoffs') return
      const seasonRow = SEASONS.find((s) => s.season === season && s.manager === r.manager)
      snubs.push({
        manager: r.manager,
        season,
        allPlayWinPct: r.allPlayWinPct,
        allPlayRank,
        fieldSize,
        regSeasonRank: seasonRow?.reg_season_rank ?? allPlayRank,
        result: r.result,
      })
    })
  }

  return snubs.sort((a, b) => b.allPlayWinPct - a.allPlayWinPct)
}
