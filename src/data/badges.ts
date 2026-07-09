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
    why: '3 titles (2017, 2019, 2025) in 8 playoff trips — the only manager active in both the ESPN and Sleeper eras to win a championship in each.',
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
    why: 'Joined as an expansion team in 2015 and already has a title (2020) despite the shortest tenure of the long-time managers.',
  },
  {
    manager: 'GBClark',
    badge: 'Journeyman',
    why: "14 seasons, 5 playoff trips, 0 titles — the definition of the league's steady middle class.",
  },
  {
    manager: 'SeanOMara',
    badge: 'Feast or Famine',
    why: '11 seasons split between deep playoff runs (a 3rd place finish) and a last-place year — no in-between.',
  },
  {
    manager: 'assif',
    badge: 'Foundational, Fadeless',
    why: "One of the league's 2012 founders; 11 seasons without a title, but never the league's worst team either.",
  },
  {
    manager: 'amenr5',
    badge: 'Too Early to Tell',
    why: 'Only 3 seasons in — the newest long-tenured manager still building a track record.',
  },
]

export const BADGE_BY_MANAGER: Record<string, Badge> = Object.fromEntries(
  BADGES.map((b) => [b.manager, b]),
)
