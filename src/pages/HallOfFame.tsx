import { useMemo, useState } from 'react'
import { ManagerLink } from '../components/ManagerLink'
import { allCareerStats, type CareerStats } from '../lib/stats'
import { num, pct } from '../lib/format'

type SortKey = keyof Pick<
  CareerStats,
  | 'seasons'
  | 'championships'
  | 'runnerUps'
  | 'playoffAppearances'
  | 'wins'
  | 'winPct'
  | 'pointsFor'
>

const COLUMNS: { key: SortKey; label: string; fmt: (c: CareerStats) => string }[] = [
  { key: 'seasons', label: 'Seasons', fmt: (c) => String(c.seasons) },
  { key: 'championships', label: 'Titles', fmt: (c) => String(c.championships) },
  { key: 'runnerUps', label: 'Runner-Ups', fmt: (c) => String(c.runnerUps) },
  { key: 'playoffAppearances', label: 'Playoffs', fmt: (c) => String(c.playoffAppearances) },
  { key: 'wins', label: 'W', fmt: (c) => String(c.wins) },
  { key: 'winPct', label: 'Win %', fmt: (c) => pct(c.winPct) },
  { key: 'pointsFor', label: 'Career PF', fmt: (c) => num(c.pointsFor) },
]

export function HallOfFame() {
  const [sort, setSort] = useState<SortKey>('championships')
  const careers = useMemo(() => allCareerStats(), [])

  const sorted = useMemo(
    () =>
      [...careers].sort((a, b) => {
        const d = (b[sort] as number) - (a[sort] as number)
        return d !== 0 ? d : b.winPct - a.winPct
      }),
    [careers, sort],
  )

  return (
    <>
      <div className="eyebrow">All-Time Leaderboard</div>
      <h1 className="page-title">Hall of Fame</h1>
      <p className="page-sub">
        Career totals for every manager across all 14 seasons. Click any column header to
        re-rank the table.
      </p>

      <div className="section" style={{ marginTop: 24 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Manager</th>
                <th>Best Finish</th>
                {COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    className={`num sortable ${sort === c.key ? '' : ''}`}
                    onClick={() => setSort(c.key)}
                  >
                    {c.label} {sort === c.key ? '▾' : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => (
                <tr key={c.manager}>
                  <td className="muted">{i + 1}</td>
                  <td>
                    <ManagerLink manager={c.manager} />
                  </td>
                  <td className="muted">{c.bestFinish}</td>
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="num">
                      {col.fmt(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
