/**
 * Franchise lineages — cases where one persistent competitive "seat" changed real-world
 * owners mid-history. Three are verified directly against raw platform data:
 *
 *  - ESPN era (2012-2018): ESPN's internal `team.id` is the seat identifier. Confirmed by
 *    pulling ESPN's leagueHistory API (`view=mTeam`) and diffing every team id season over
 *    season. One seat was handed to a new owner and kept the same id: team id 12 (Andy
 *    Engler, 2015 → Devin Nevels, 2016-2018). See docs/HANDOFF.md.
 *  - Sleeper era (2019-2025): Sleeper's `roster_id` is the seat identifier, already captured
 *    in `league_data.json`'s `roster_id_map_2019_2025`. Two seats changed owners: roster 6
 *    (JPeters19 → Keughes, 2024) and roster 12 (assif → amenr5, 2023).
 *
 * The fourth — Keith Robertson (2012-2013) → Tyler Keel (2014+) — is NOT supported by
 * ESPN's raw team id: id 7 (Robertson's) was retired in 2014, not reassigned, and Keel
 * got a brand-new id 11. It's included here at the league owner's explicit direction,
 * based on real-world recollection of how the seat changed hands, overriding the ESPN id
 * signal. This does not affect either manager's individual stats — those were already
 * corrected (and remain correct) based on hard primaryOwner-id evidence; this only
 * affects how the two are grouped for franchise-level display.
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
    id: 'robertson-keel',
    owners: [
      { manager: 'KRobertson', seasons: [2012, 2013] },
      {
        manager: 'TylerKeel',
        seasons: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
      },
    ],
  },
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
