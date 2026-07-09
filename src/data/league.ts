import raw from './league_data.json'
import playoffRecordsRaw from './playoff_records.json'
import matchupLogRaw from './matchup_log.json'
import playoffBracketsRaw from './playoff_brackets.json'
import draftHistoryRaw from './draft_history.json'
import tradeHistoryRaw from './trade_history.json'

/**
 * Typed access layer over the compiled Sunday Funday dataset (league_data.json).
 *
 * Data provenance (see docs/HANDOFF.md):
 *  - 2012-2018: manually curated ESPN-era records, mapped to current Sleeper identities.
 *  - 2019-2025: pulled from Sleeper's public API.
 *  - 2026 is pre-draft (no games) and is excluded from every stat.
 */

export type PlayoffResult =
  | 'Champion'
  | 'Runner-Up'
  | '3rd Place'
  | '4th Place'
  | 'Made Playoffs'
  | 'Missed Playoffs'

export interface SeasonRow {
  season: number
  reg_season_rank: number
  manager: string
  team: string
  w: number
  l: number
  pf: number
  result: PlayoffResult
  pa: number
}

export interface ManagerIdentity {
  real_name: string | null
  espn_surname?: string
  note?: string
}

interface LeagueDataShape {
  league_id_current: string
  league_name: string
  user_sleeper_username: string
  user_sleeper_user_id: string
  league_chain_by_season: Record<string, string>
  manager_identity: Record<string, ManagerIdentity>
  roster_id_map_2019_2025: Record<string, unknown>
  all_seasons_data: SeasonRow[]
}

const data = raw as unknown as LeagueDataShape

export const LEAGUE_NAME = data.league_name
export const LEAGUE_ID_CURRENT = data.league_id_current
export const LEAGUE_CHAIN = data.league_chain_by_season
export const MANAGER_IDENTITY = data.manager_identity

/** Every season-team row, sorted by season then regular-season rank. */
export const SEASONS: SeasonRow[] = [...data.all_seasons_data].sort(
  (a, b) => a.season - b.season || a.reg_season_rank - b.reg_season_rank,
)

/** Distinct seasons that have completed games, ascending. */
export const SEASON_YEARS: number[] = [...new Set(SEASONS.map((r) => r.season))].sort(
  (a, b) => a - b,
)

/** Distinct manager handles. */
export const MANAGERS: string[] = [...new Set(SEASONS.map((r) => r.manager))].sort()

/** Human-friendly display name for a manager handle. */
export function displayName(manager: string): string {
  const real = MANAGER_IDENTITY[manager]?.real_name
  return real ?? manager
}

/** Playoff field size for a given season (4 in the 10-team era, 6 from 2015 on). */
export function playoffFieldSize(season: number): number {
  return season <= 2014 ? 4 : 6
}

export interface PlayoffRecord {
  wins: number
  losses: number
}

/** Real playoff win/loss record per season per manager, pulled from ESPN + Sleeper APIs directly. */
export const PLAYOFF_RECORDS = playoffRecordsRaw as unknown as Record<
  string,
  Record<string, PlayoffRecord>
>

export function playoffRecordFor(season: number, manager: string): PlayoffRecord {
  return PLAYOFF_RECORDS[String(season)]?.[manager] ?? { wins: 0, losses: 0 }
}

export type GamePhase = 'regular' | 'playoff'

export interface MatchupGame {
  season: number
  week: number
  phase: GamePhase
  manager: string
  opponent: string
  result: 'W' | 'L' | 'T'
  pf: number
  pa: number
  /** True for toilet-bowl games (non-qualifier brackets) — excluded from playoff records. */
  consolation?: boolean
}

/**
 * Full week-by-week game log, 2012-2025, both eras — one entry per manager per game
 * (so every real game appears twice, once from each side). Powers the Head-to-Head grid.
 */
export const MATCHUP_LOG = matchupLogRaw as unknown as MatchupGame[]

export interface BracketGame {
  week: number
  opponent: string
  result: 'W' | 'L' | 'T'
  round: number | null
  place: number | null
  tier: string | null
  pf: number | null
  pa: number | null
  consolation?: boolean
}

/**
 * Per-season, per-manager ordered list of real playoff bracket games (round,
 * opponent, result, and — where the source tracks it — the finishing place
 * the game decided). Powers the playoff bracket visualization.
 */
export const PLAYOFF_BRACKETS = playoffBracketsRaw as unknown as Record<
  string,
  Record<string, BracketGame[]>
>

export function playoffBracketFor(season: number, manager: string): BracketGame[] {
  return PLAYOFF_BRACKETS[String(season)]?.[manager] ?? []
}

export interface DraftPick {
  overall: number
  round: number
  pickInRound: number
  manager: string
  player: string
  position?: string
  keeper: boolean
}

export interface DraftSeason {
  source: 'ESPN' | 'Sleeper'
  picks: DraftPick[]
}

/**
 * Real draft results for every season, 2012-2025 — pulled directly from ESPN's
 * and Sleeper's draft APIs (not a placeholder or reconstruction).
 */
export const DRAFT_HISTORY = draftHistoryRaw as unknown as Record<string, DraftSeason>

export function draftForSeason(season: number): DraftPick[] {
  return DRAFT_HISTORY[String(season)]?.picks ?? []
}

export interface TradeParty {
  manager: string
  received: string[]
}

export interface Trade {
  week: number
  parties: TradeParty[]
}

/**
 * Completed trades per season, pulled from Sleeper's transactions API.
 * Sleeper era only (2019+) — ESPN's API no longer serves historical
 * transaction data for 2012-2018, so those seasons have no entries.
 */
export const TRADE_HISTORY = tradeHistoryRaw as unknown as Record<string, Trade[]>

export function tradesForSeason(season: number): Trade[] {
  return TRADE_HISTORY[String(season)] ?? []
}
