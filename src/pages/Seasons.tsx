import { useState } from 'react'
import { ManagerLink } from '../components/ManagerLink'
import { ResultBadge } from '../components/ResultBadge'
import { SEASONS, SEASON_YEARS, USER_USERNAME } from '../data/league'
import { luckRating } from '../lib/stats'
import { num, signedPct } from '../lib/format'

export function Seasons() {
  const [year, setYear] = useState<number>(SEASON_YEARS[SEASON_YEARS.length - 1])
  const rows = SEASONS.filter((r) => r.season === year)

  return (
    <>
      <div className="eyebrow">Standings</div>
      <h1 className="page-title">Season by Season</h1>
      <p className="page-sub">
        Final regular-season standings and playoff results for every year of the league.
        Luck rating is actual win % minus Pythagorean-expected win % — positive means the
        team won more than its scoring deserved.
      </p>

      <div className="section" style={{ marginTop: 24 }}>
        <div className="row-between" style={{ marginBottom: 16 }}>
          <select
            className="select"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[...SEASON_YEARS].reverse().map((y) => (
              <option key={y} value={y}>
                {y} Season
              </option>
            ))}
          </select>
          <span className="muted">{rows.length} teams</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Manager</th>
                <th>Team</th>
                <th className="num">W-L</th>
                <th className="num">PF</th>
                <th className="num">PA</th>
                <th className="num">Diff</th>
                <th className="num">Luck</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const luck = luckRating(r)
                const diff = r.pf - r.pa
                return (
                  <tr
                    key={r.manager}
                    className={r.manager === USER_USERNAME ? 'you-row' : undefined}
                  >
                    <td style={{ fontWeight: 700 }}>{r.reg_season_rank}</td>
                    <td>
                      <ManagerLink manager={r.manager} />
                    </td>
                    <td className="muted">{r.team}</td>
                    <td className="num">
                      {r.w}-{r.l}
                    </td>
                    <td className="num">{num(r.pf)}</td>
                    <td className="num">{num(r.pa)}</td>
                    <td className={`num ${diff >= 0 ? 'pos' : 'neg'}`}>
                      {diff >= 0 ? '+' : ''}
                      {num(diff)}
                    </td>
                    <td className={`num ${luck >= 0 ? 'pos' : 'neg'}`}>{signedPct(luck)}</td>
                    <td>
                      <ResultBadge result={r.result} />
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
