import { Link } from 'react-router-dom'
import { ManagerLink } from '../components/ManagerLink'
import { SEASONS, SEASON_YEARS } from '../data/league'
import { seasonPodiums } from '../lib/stats'
import { num } from '../lib/format'

function bestRecordFor(season: number) {
  const rows = SEASONS.filter((r) => r.season === season)
  return rows.reduce((best, r) => {
    if (!best) return r
    if (r.w > best.w) return r
    if (r.w === best.w && r.pf > best.pf) return r
    return best
  }, rows[0])
}

function topScorerFor(season: number) {
  const rows = SEASONS.filter((r) => r.season === season)
  return rows.reduce((best, r) => (r.pf > best.pf ? r : best), rows[0])
}

export function Seasons() {
  const podiums = new Map(seasonPodiums().map((p) => [p.season, p]))
  const years = [...SEASON_YEARS].reverse()

  return (
    <>
      <div className="eyebrow">Standings</div>
      <h1 className="page-title">Season by Season</h1>
      <p className="page-sub">
        Every season of the league at a glance. Click into a season for full standings and
        playoff results.
      </p>

      <div className="section" style={{ marginTop: 24 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Season</th>
                <th>Champion</th>
                <th>Runner-Up</th>
                <th>Best Record</th>
                <th>Top Scorer</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {years.map((year) => {
                const podium = podiums.get(year)
                const best = bestRecordFor(year)
                const top = topScorerFor(year)
                return (
                  <tr key={year}>
                    <td style={{ fontWeight: 700 }}>
                      <Link to={`/seasons/${year}`}>{year}</Link>
                    </td>
                    <td>
                      {podium?.champion ? (
                        <>
                          <span aria-hidden>🏆</span> <ManagerLink manager={podium.champion} />
                        </>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      {podium?.runnerUp ? (
                        <ManagerLink manager={podium.runnerUp} />
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      {best.w}-{best.l} (<ManagerLink manager={best.manager} />)
                    </td>
                    <td>
                      <ManagerLink manager={top.manager} /> <span className="num">{num(top.pf)}</span>
                    </td>
                    <td>
                      <Link to={`/seasons/${year}`} className="muted" style={{ fontSize: 13 }}>
                        View →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
