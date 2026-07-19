import { SEASONS, displayName, type SeasonRow } from '../data/league'
import { FRANCHISES, type Franchise } from '../data/franchises'
import { aggregateStats, type AggregateStats } from './stats'

const SEASON_KEY_TO_FRANCHISE = new Map<string, string>()
for (const f of FRANCHISES) {
  for (const era of f.owners) {
    for (const season of era.seasons) {
      SEASON_KEY_TO_FRANCHISE.set(`${era.manager}|${season}`, f.id)
    }
  }
}

/**
 * The franchise a manager's season belongs to. Defaults to the manager's own handle for
 * every season not part of a multi-owner lineage in FRANCHISES — i.e. every manager is
 * implicitly a single-owner franchise unless explicitly listed otherwise.
 */
export function franchiseIdFor(manager: string, season: number): string {
  return SEASON_KEY_TO_FRANCHISE.get(`${manager}|${season}`) ?? manager
}

export function franchiseById(id: string): Franchise | undefined {
  return FRANCHISES.find((f) => f.id === id)
}

/** The multi-owner franchise a manager belongs to, if their seat ever changed hands. */
export function franchiseForManager(manager: string): Franchise | undefined {
  return FRANCHISES.find((f) => f.owners.some((o) => o.manager === manager))
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
