import raw from './league_data.json'

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
export const USER_USERNAME = data.user_sleeper_username
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
