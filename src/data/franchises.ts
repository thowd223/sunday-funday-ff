/**
 * Franchise lineages — cases where one persistent competitive "seat" changed real-world
 * owners mid-history. Verified directly against raw platform data, not inferred:
 *
 *  - ESPN era (2012-2018): ESPN's internal `team.id` is the seat identifier. Confirmed by
 *    pulling ESPN's leagueHistory API (`view=mTeam`) and diffing every team id season over
 *    season. Only one seat was ever handed to a new owner and kept the same id: team id 12
 *    (Andy Engler, 2015 → devin nevels, 2016-2018). Every other ESPN-era departure (e.g.
 *    Keith Robertson after 2013) saw that id retired rather than reassigned — those are
 *    correctly separate, unrelated managers, not franchises. See docs/HANDOFF.md.
 *  - Sleeper era (2019-2025): Sleeper's `roster_id` is the seat identifier, already captured
 *    in `league_data.json`'s `roster_id_map_2019_2025`. Two seats changed owners: roster 6
 *    (JPeters19 → Keughes, 2024) and roster 12 (assif → amenr5, 2023).
 *
 * ESPN and Sleeper use entirely independent id systems — there is no cross-platform
 * franchise linkage. A manager who played continuously across the 2018→2019 platform
 * switch (e.g. kdavis) doesn't need a franchise entry here at all: their season rows
 * already share one manager handle, which is franchise continuity enough. Every manager
 * NOT listed below is their own implicit single-owner franchise (see franchiseIdFor in
 * ../lib/franchise.ts).
 */
export interface FranchiseOwnerEra {
  manager: string
  seasons: number[]
}

export interface Franchise {
  id: string
  owners: FranchiseOwnerEra[]
}

export const FRANCHISES: Franchise[] = [
  {
    id: 'engler-nevels',
    owners: [
      { manager: 'amenr5', seasons: [2015] },
      { manager: 'dnevels8', seasons: [2016, 2017, 2018] },
    ],
  },
  {
    id: 'jpeters-keughes',
    owners: [
      { manager: 'JPeters19', seasons: [2019, 2020, 2021, 2022, 2023] },
      { manager: 'Keughes', seasons: [2024, 2025] },
    ],
  },
  {
    id: 'assif-amenr5',
    owners: [
      { manager: 'assif', seasons: [2019, 2020, 2021, 2022] },
      { manager: 'amenr5', seasons: [2023, 2024, 2025] },
    ],
  },
]
