/**
 * Live Sleeper API helpers for the Head-to-Head grid.
 *
 * Sleeper's public API needs no auth and is fully CORS-open, so these calls run
 * directly from the browser. We only reach the network for genuinely new data
 * (weekly matchups); everything else already lives in the bundled dataset.
 */
import { LEAGUE_CHAIN, MANAGER_IDENTITY } from '../data/league'

const API = 'https://api.sleeper.app/v1'

/** Sleeper seasons only (the ESPN era 2012-2018 has no per-week matchup API). */
export const SLEEPER_SEASONS = Object.keys(LEAGUE_CHAIN)
  .map(Number)
  .filter((y) => y >= 2019 && y <= 2025)
  .sort((a, b) => a - b)

interface SleeperRoster {
  roster_id: number
  owner_id: string | null
}

interface SleeperUser {
  user_id: string
  display_name: string
}

interface SleeperMatchup {
  matchup_id: number | null
  roster_id: number
  points: number
}

interface SleeperLeague {
  settings?: { playoff_week_start?: number }
}

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Sleeper API ${res.status} for ${url}`)
  return res.json() as Promise<T>
}

/** Lower-cased Sleeper display_name -> canonical manager handle from our identity map. */
const HANDLE_BY_LOWER = new Map<string, string>(
  Object.keys(MANAGER_IDENTITY).map((h) => [h.toLowerCase(), h]),
)
// Known alias: "AsifL" in some seasons is the same owner as "assif".
HANDLE_BY_LOWER.set('asifl', 'assif')

function canonicalHandle(displayName: string): string {
  return HANDLE_BY_LOWER.get(displayName.toLowerCase()) ?? displayName
}

export interface H2HCell {
  w: number
  l: number
  t: number
  pf: number
  pa: number
}

export type H2HMatrix = Record<string, Record<string, H2HCell>>

export interface H2HProgress {
  season: number
  week: number
  totalWeeks: number
  doneWeeks: number
}

/**
 * Build the all-time pairwise head-to-head matrix from real weekly matchups
 * across every Sleeper regular-season week (2019-2025).
 */
export async function buildHeadToHead(
  onProgress?: (p: H2HProgress) => void,
): Promise<H2HMatrix> {
  const matrix: H2HMatrix = {}
  const ensure = (a: string, b: string): H2HCell => {
    matrix[a] ??= {}
    matrix[a][b] ??= { w: 0, l: 0, t: 0, pf: 0, pa: 0 }
    return matrix[a][b]
  }

  // Pre-compute the per-season week list so progress reporting is accurate.
  const plans: { season: number; leagueId: string; weeks: number[] }[] = []
  for (const season of SLEEPER_SEASONS) {
    const leagueId = LEAGUE_CHAIN[String(season)]
    const league = await getJSON<SleeperLeague>(`${API}/league/${leagueId}`)
    const playoffStart = league.settings?.playoff_week_start ?? 15
    const weeks = Array.from({ length: playoffStart - 1 }, (_, i) => i + 1)
    plans.push({ season, leagueId, weeks })
  }
  const totalWeeks = plans.reduce((acc, p) => acc + p.weeks.length, 0)
  let doneWeeks = 0

  for (const { season, leagueId, weeks } of plans) {
    // roster_id -> manager handle for this season.
    const [rosters, users] = await Promise.all([
      getJSON<SleeperRoster[]>(`${API}/league/${leagueId}/rosters`),
      getJSON<SleeperUser[]>(`${API}/league/${leagueId}/users`),
    ])
    const nameByUser = new Map(users.map((u) => [u.user_id, u.display_name]))
    const handleByRoster = new Map<number, string>()
    for (const r of rosters) {
      const dn = r.owner_id ? nameByUser.get(r.owner_id) : undefined
      handleByRoster.set(r.roster_id, dn ? canonicalHandle(dn) : `roster${r.roster_id}`)
    }

    for (const week of weeks) {
      const matchups = await getJSON<SleeperMatchup[]>(
        `${API}/league/${leagueId}/matchups/${week}`,
      )
      // Group by matchup_id to find head-to-head pairs.
      const byMatchup = new Map<number, SleeperMatchup[]>()
      for (const m of matchups) {
        if (m.matchup_id == null) continue
        const arr = byMatchup.get(m.matchup_id) ?? []
        arr.push(m)
        byMatchup.set(m.matchup_id, arr)
      }
      for (const pair of byMatchup.values()) {
        if (pair.length !== 2) continue
        const [x, y] = pair
        const hx = handleByRoster.get(x.roster_id)!
        const hy = handleByRoster.get(y.roster_id)!
        const cx = ensure(hx, hy)
        const cy = ensure(hy, hx)
        cx.pf += x.points
        cx.pa += y.points
        cy.pf += y.points
        cy.pa += x.points
        if (x.points > y.points) {
          cx.w++
          cy.l++
        } else if (x.points < y.points) {
          cx.l++
          cy.w++
        } else {
          cx.t++
          cy.t++
        }
      }
      doneWeeks++
      onProgress?.({ season, week, totalWeeks, doneWeeks })
    }
  }

  return matrix
}
