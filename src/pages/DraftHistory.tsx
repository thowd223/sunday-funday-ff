import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ManagerLink } from '../components/ManagerLink'
import { draftForSeason, SEASON_YEARS } from '../data/league'

export function DraftHistory() {
  const { year: yearParam } = useParams()
  const navigate = useNavigate()

  const latestYear = SEASON_YEARS[SEASON_YEARS.length - 1]
  const parsedYear = yearParam ? Number(yearParam) : NaN
  const year = SEASON_YEARS.includes(parsedYear) ? parsedYear : latestYear

  const picks = draftForSeason(year)

  const rounds = useMemo(() => {
    const byRound = new Map<number, typeof picks>()
    for (const p of picks) {
      const list = byRound.get(p.round) ?? []
      list.push(p)
      byRound.set(p.round, list)
    }
    return [...byRound.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([round, list]) => ({
        round,
        picks: [...list].sort((a, b) => a.pickInRound - b.pickInRound),
      }))
  }, [picks])

  const teamCount = new Set(picks.map((p) => p.manager)).size
  const keeperCount = picks.filter((p) => p.keeper).length

  return (
    <>
      <div className="eyebrow">Draft</div>
      <h1 className="page-title">Draft History</h1>
      <p className="page-sub">
        Every pick from every draft, 2012–2025 — pulled directly from ESPN's and Sleeper's draft
        APIs. Keeper picks are marked with a "K" tag. Want the league-wide grading — first-pick
        curses, draft-day loyalty, positional tendencies? See the{' '}
        <Link to="/draft-grades">Draft Report Card →</Link>
      </p>

      <div className="section" style={{ marginTop: 24 }}>
        <div className="row-between" style={{ marginBottom: 16 }}>
          <select
            className="select"
            value={year}
            onChange={(e) => navigate(`/draft-history/${e.target.value}`)}
          >
            {[...SEASON_YEARS].reverse().map((y) => (
              <option key={y} value={y}>
                {y} Draft
              </option>
            ))}
          </select>
          {picks.length > 0 && (
            <span className="muted">
              {teamCount} teams · {rounds.length} rounds · {picks.length} picks
              {keeperCount > 0 ? ` · ${keeperCount} keepers` : ''}
            </span>
          )}
        </div>

        {picks.length === 0 ? (
          <p className="muted">No draft data available for {year}.</p>
        ) : (
          rounds.map((r) => (
            <div key={r.round} className="table-wrap" style={{ marginBottom: 20 }}>
              <table>
                <thead>
                  <tr>
                    <th colSpan={4}>Round {r.round}</th>
                  </tr>
                  <tr>
                    <th className="num">Pick</th>
                    <th>Manager</th>
                    <th>Player</th>
                    <th>Position</th>
                  </tr>
                </thead>
                <tbody>
                  {r.picks.map((p) => (
                    <tr key={p.overall}>
                      <td className="num">{p.overall}</td>
                      <td>
                        <ManagerLink manager={p.manager} />
                      </td>
                      <td>
                        {p.player}
                        {p.keeper && (
                          <span className="chip" style={{ marginLeft: 8 }}>
                            K
                          </span>
                        )}
                      </td>
                      <td className="muted">{p.position ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </>
  )
}
