import { SEASONS, displayName, type SeasonRow } from '../data/league'
import { FRANCHISES, type Franchise } from '../data/franchises'
import { aggregateStats, type AggregateStats } from './stats'

const SEASON_KEY_TO_FRANCHISE = new Map<string, string>()
const MANAGER_TO_FRANCHISES = new Map<string, Franchise[]>()
for (const f of FRANCHISES) {
  for (const era of f.owners) {
    for (const season of era.seasons) {
      SEASON_KEY_TO_FRANCHISE.set(`${era.manager}|${season}`, f.id)
    }
    const list = MANAGER_TO_FRANCHISES.get(era.manager) ?? []
    list.push(f)
    MANAGER_TO_FRANCHISES.set(era.manager, list)
  }
}

/**
 * The franchise a manager's season belongs to.
 *
 * Most managers only ever occupy one seat, so this is just their own handle. But a
 * manager whose seat is tracked as a multi-owner FRANCHISES lineage can also have
 * *other* seasons under the same handle that aren't explicitly listed — e.g. JPeters19's
 * pre-2019 ESPN seasons aren't listed under `jpeters-keughes` (only his 2019-2023 Sleeper
 * portion is, since that's the part with hard roster_id evidence), but they're still the
 * same uninterrupted personal tenure on the same seat, not a separate franchise. Those
 * gap seasons are attached to whichever of the manager's franchises has the closest
 * listed season, so one person's unbroken run isn't split by the ESPN/Sleeper platform
 * boundary. A manager who genuinely held two different, unrelated seats over their
 * career (e.g. Andy Engler's 2015 ESPN stint vs. his 2023+ Sleeper seat) has both fully
 * enumerated in FRANCHISES already, so there's no gap for this fallback to guess at.
 */
export function franchiseIdFor(manager: string, season: number): string {
  const explicit = SEASON_KEY_TO_FRANCHISE.get(`${manager}|${season}`)
  if (explicit) return explicit

  const candidates = MANAGER_TO_FRANCHISES.get(manager)
  if (!candidates || candidates.length === 0) return manager

  let best = candidates[0]
  let bestDistance = Infinity
  for (const f of candidates) {
    const covered = f.owners.flatMap((o) => o.seasons)
    const distance = Math.min(...covered.map((s) => Math.abs(s - season)))
    if (distance < bestDistance) {
      bestDistance = distance
      best = f
    }
  }
  return best.id
}

export function franchiseById(id: string): Franchise | undefined {
  return FRANCHISES.find((f) => f.id === id)
}

/** Every franchise a manager belongs to — usually one, but a manager who held two
 * distinct seats over their career (e.g. left and came back to a different seat) can
 * belong to more than one. */
export function franchisesForManager(manager: string): Franchise[] {
  return MANAGER_TO_FRANCHISES.get(manager) ?? []
}

/** Chronological owner handles for a franchise id — just `[id]` for a single-owner franchise. */
export function franchiseOwners(id: string): string[] {
  const f = franchiseById(id)
  return f ? f.owners.map((o) => o.manager) : [id]
}

/** Display name: the current (most recent) owner, since the seat's identity today is theirs. */
export function franchiseDisplayName(id: string): string {
  const owners = franchiseOwners(id)
  return displayName(owners[owners.length - 1])
}

export function franchiseSeasons(id: string): SeasonRow[] {
  return SEASONS.filter((r) => franchiseIdFor(r.manager, r.season) === id)
}

/** Every distinct franchise id that has ever fielded a team. */
export function allFranchiseIds(): string[] {
  const ids = new Set<string>()
  for (const r of SEASONS) ids.add(franchiseIdFor(r.manager, r.season))
  return [...ids]
}

export interface FranchiseCareerStats extends AggregateStats {
  id: string
  owners: string[]
  isMultiOwner: boolean
}

export function franchiseCareerStats(id: string): FranchiseCareerStats {
  const owners = franchiseOwners(id)
  return {
    id,
    owners,
    isMultiOwner: owners.length > 1,
    ...aggregateStats(franchiseSeasons(id)),
  }
}

export function allFranchiseCareerStats(): FranchiseCareerStats[] {
  return allFranchiseIds().map(franchiseCareerStats)
}
