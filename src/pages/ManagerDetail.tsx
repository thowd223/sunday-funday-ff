import { Link, useParams } from 'react-router-dom'
import { StatCard } from '../components/StatCard'
import { ResultBadge } from '../components/ResultBadge'
import {
  MANAGER_IDENTITY,
  MANAGERS,
  SEASONS,
  USER_USERNAME,
  displayName,
} from '../data/league'
import { BADGE_BY_MANAGER } from '../data/badges'
import { careerStats, luckRating } from '../lib/stats'
import { num, pct, signedPct } from '../lib/format'

export function ManagerDetail() {
  const { manager = '' } = useParams()

  if (!MANAGERS.includes(manager)) {
    return (
      <>
        <h1 className="page-title">Unknown manager</h1>
        <p className="page-sub">
          No records for “{manager}”. <Link to="/managers">Back to all managers →</Link>
        </p>
      </>
    )
  }

  const c = careerStats(manager)
  const rows = SEASONS.filter((r) => r.manager === manager).sort((a, b) => b.season - a.season)
  const identity = MANAGER_IDENTITY[manager]
  const badge = BADGE_BY_MANAGER[manager]
  const isUser = manager === USER_USERNAME
  const initials = displayName(manager).slice(0, 2).toUpperCase()

  return (
    <>
      <Link to="/managers" className="muted" style={{ fontSize: 13 }}>
        ← All managers
      </Link>

      <div className="section mgr-header" style={{ marginTop: 16 }}>
        <div className="avatar">{initials}</div>
        <div>
          <h1 className="page-title" style={{ fontSize: 30 }}>
            {displayName(manager)}
            {isUser && <span className="tag-you">YOU</span>}
          </h1>
          <div className="muted">@{manager}</div>
          {badge && (
            <div className="badge-tag" style={{ marginTop: 6, fontSize: 15 }}>
              {badge.badge}
            </div>
          )}
        </div>
      </div>

      {badge && <p className="note" style={{ maxWidth: '70ch' }}>{badge.why}</p>}
      {identity?.note && <p className="note callout" style={{ marginTop: 12 }}>{identity.note}</p>}

      <section className="section">
        <div className="grid stat-grid">
          <StatCard label="Championships" value={c.championships} />
          <StatCard
            label="Career Record"
            value={`${c.wins}-${c.losses}`}
            meta={`${pct(c.winPct)} win rate`}
          />
          <StatCard label="Playoff Appearances" value={c.playoffAppearances} />
          <StatCard label="Seasons" value={c.seasons} meta={`${c.firstSeason}–${c.lastSeason}`} />
          <StatCard label="Runner-Ups" value={c.runnerUps} />
          <StatCard label="3rd Places" value={c.thirdPlaces} />
          <StatCard
            label="Point Differential"
            value={
              <span className={c.pointDiff >= 0 ? 'pos' : 'neg'}>
                {c.pointDiff >= 0 ? '+' : ''}
                {num(c.pointDiff)}
              </span>
            }
            meta={`${num(c.pointsFor)} for / ${num(c.pointsAgainst)} against`}
          />
          <StatCard
            label="Avg Luck Rating"
            value={
              <span className={c.avgLuck >= 0 ? 'pos' : 'neg'}>{signedPct(c.avgLuck)}</span>
            }
          />
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Season by Season</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Season</th>
                <th>Team</th>
                <th className="num">Rank</th>
                <th className="num">W-L</th>
                <th className="num">PF</th>
                <th className="num">Luck</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const luck = luckRating(r)
                return (
                  <tr key={r.season}>
                    <td style={{ fontWeight: 700 }}>{r.season}</td>
                    <td className="muted">{r.team}</td>
                    <td className="num">{r.reg_season_rank}</td>
                    <td className="num">
                      {r.w}-{r.l}
                    </td>
                    <td className="num">{num(r.pf)}</td>
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
      </section>
    </>
  )
}
