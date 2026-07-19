import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FranchiseLink } from '../components/FranchiseLink'
import { ManagerLink } from '../components/ManagerLink'
import { allFranchiseCareerStats, type FranchiseCareerStats } from '../lib/franchise'
import { num, pct } from '../lib/format'

type SortKey = keyof Pick<
  FranchiseCareerStats,
  | 'seasons'
  | 'championships'
  | 'runnerUps'
  | 'playoffAppearances'
  | 'wins'
  | 'winPct'
  | 'pointsFor'
>

const COLUMNS: { key: SortKey; label: string; fmt: (c: FranchiseCareerStats) => string }[] = [
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
  const franchises = useMemo(() => allFranchiseCareerStats(), [])

  const sorted = useMemo(
    () =>
      [...franchises].sort((a, b) => {
        const d = (b[sort] as number) - (a[sort] as number)
        return d !== 0 ? d : b.winPct - a.winPct
      }),
    [franchises, sort],
  )

  return (
    <>
      <div className="eyebrow">All-Time Leaderboard</div>
      <h1 className="page-title">Hall of Fame</h1>
      <p className="page-sub">
        Career totals for every franchise across all 14 seasons — ranked by franchise seat,
        not just the person currently holding it. A handful of seats changed owners over the
        years (see <FranchiseLink id="jpeters-keughes" plain />, for one); their combined
        history is credited to the seat. For pure individual career stats, see{' '}
        <Link to="/managers">Managers</Link>. Click any column header to re-rank the table.
      </p>

      <div className="section" style={{ marginTop: 24 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Franchise</th>
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
                <tr key={c.id}>
                  <td className="muted">{i + 1}</td>
                  <td>
                    <FranchiseLink id={c.id} />
                    {c.isMultiOwner && (
                      <div className="muted" style={{ fontSize: 12 }}>
                        {c.owners.map((o, idx) => (
                          <span key={o}>
                            {idx > 0 && ' → '}
                            <ManagerLink manager={o} plain />
                          </span>
                        ))}
                      </div>
                    )}
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
