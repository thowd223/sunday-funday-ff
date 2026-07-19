/**
 * Qualitative career badges — the story the numbers tell for each manager.
 * Carried over from the League History workbook's "League Awards" sheet.
 */
export interface Badge {
  manager: string
  badge: string
  why: string
}

export const BADGES: Badge[] = [
  {
    manager: 'jphn744',
    badge: 'The Closer',
    why: '5 titles from 10 playoff trips (50% conversion) — the best in league history at finishing the job.',
  },
  {
    manager: 'kdavis',
    badge: 'Iron Throne, Empty Hand',
    why: "Best career win% (62%) and the most playoff trips (12) of anyone, but only 2 titles (17% conversion) — the best regular-season team that can't close, including a 12-1 season that ended in 4th.",
  },
  {
    manager: 'bcorrigan30',
    badge: 'Bronze Standard',
    why: '6 third-place finishes across 14 seasons and zero titles — reaches the final four almost every deep run, never wins it.',
  },
  {
    manager: 'thowd',
    badge: 'Big Game Hunter',
    why: 'Won titles in 2017, 2019, and 2025 — never back-to-back, but never far from contention either, across 8 playoff trips.',
  },
  {
    manager: 'TylerKeel',
    badge: 'Wooden Spoon King',
    why: '3 last-place finishes, more than anyone else, including the worst single season in league history (1-12 in 2018).',
  },
  {
    manager: 'peterbrune',
    badge: 'Boom or Bust',
    why: "Set the all-time single-season scoring record (1912.3 in 2021) — and lost that year's championship anyway.",
  },
  {
    manager: 'YungSimba',
    badge: 'The Nearly Man',
    why: '3 fourth-place finishes, the most of anyone at that exact spot — agonizingly close, repeatedly.',
  },
  {
    manager: 'dnevels8',
    badge: 'Late Arrival, Fast Learner',
    why: 'Joined as an expansion team in 2015 and already has a title (2020) — one of the shortest tenures of the long-time managers, and already a champion.',
  },
  {
    manager: 'GBClark',
    badge: 'Journeyman',
    why: "14 seasons, 5 playoff trips, 0 titles — the definition of the league's steady middle class.",
  },
  {
    manager: 'SeanOMara',
    badge: 'Feast or Famine',
    why: 'No middle ground in 11 seasons — a Runner-Up finish (2019) and two 3rd-place runs, bookended by six years missing the playoffs outright. Never technically finished last, though the 11th-of-12 finishes (2018, 2020) came close.',
  },
  {
    manager: 'assif',
    badge: 'Foundational, Fadeless',
    why: "One of the league's 2012 founders — 11 seasons, no titles, two last-place finishes (2015, 2019), and one shocking 3rd-place run (2016) sandwiched in between.",
  },
  {
    manager: 'amenr5',
    badge: 'Too Early to Tell',
    why: 'Only 3 seasons in — the newest long-tenured manager still building a track record.',
  },
  {
    manager: 'JPeters19',
    badge: 'The Founding Champion',
    why: "Won the league's very first championship in 2012, then didn't sniff the podium again until back-to-back Runner-Up finishes in 2017 and 2023 — with a long playoff drought in between (5 of 12 seasons). Left the league after 2023.",
  },
  {
    manager: 'Keughes',
    badge: 'Sophomore Slump',
    why: 'A strong rookie campaign in 2024 (2-seed, 4th Place) was followed immediately by a 3-11 last-place finish in 2025 — too small a sample yet to know which season is the outlier.',
  },
]

export const BADGE_BY_MANAGER: Record<string, Badge> = Object.fromEntries(
  BADGES.map((b) => [b.manager, b]),
)
