import { Link, useParams } from 'react-router-dom'
import { StatCard } from '../components/StatCard'
import { ResultBadge } from '../components/ResultBadge'
import { ManagerLink } from '../components/ManagerLink'
import { displayName, playoffRecordFor } from '../data/league'
import { luckRating, winPct as winPctOf } from '../lib/stats'
import {
  allFranchiseIds,
  franchiseById,
  franchiseCareerStats,
  franchiseDisplayName,
  franchiseSeasons,
} from '../lib/franchise'
import { num, pct, signedPct } from '../lib/format'

export function FranchiseDetail() {
  const { id = '' } = useParams()

  if (!allFranchiseIds().includes(id)) {
    return (
      <>
        <h1 className="page-title">Unknown franchise</h1>
        <p className="page-sub">
          No records for “{id}”. <Link to="/franchises">Back to all franchises →</Link>
        </p>
      </>
    )
  }

  const c = franchiseCareerStats(id)
  const rows = franchiseSeasons(id).sort((a, b) => b.season - a.season)
  const franchise = franchiseById(id)
  const initials = franchiseDisplayName(id).slice(0, 2).toUpperCase()

  return (
    <>
      <Link to="/franchises" className="muted" style={{ fontSize: 13 }}>
        ← All franchises
      </Link>

      <div className="section mgr-header" style={{ marginTop: 16 }}>
        <div className="avatar">{initials}</div>
        <div>
          <h1 className="page-title" style={{ fontSize: 30 }}>
            {franchiseDisplayName(id)}
          </h1>
          <div className="muted">
            {c.firstSeason}–{c.lastSeason} · {c.isMultiOwner ? `${c.owners.length} owners` : 'Single owner'}
          </div>
        </div>
      </div>

      {c.isMultiOwner && franchise && (
        <section className="section">
          <h2 className="section-title">Owner Timeline</h2>
          <div className="grid stat-grid">
            {franchise.owners.map((era) => (
              <Link
                key={era.manager}
                to={`/managers/${era.manager}`}
                className="card stat"
                style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
              >
                <div className="label">
                  {Math.min(...era.seasons)}–{Math.max(...era.seasons)}
                </div>
                <div className="value">{displayName(era.manager)}</div>
                <div className="meta">{era.seasons.length} seasons · full career page →</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="grid stat-grid">
          <StatCard label="Championships" value={c.championships} />
          <StatCard
            label="Franchise Record"
            value={`${c.wins}-${c.losses}`}
            meta={`${pct(c.winPct)} win rate`}
          />
          <StatCard label="Playoff Appearances" value={c.playoffAppearances} />
          <StatCard
            label="Playoff Record"
            value={`${c.playoffWins}-${c.playoffLosses}`}
            meta={`${pct(winPctOf(c.playoffWins, c.playoffLosses))} in the postseason`}
          />
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
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Season by Season</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Season</th>
                {c.isMultiOwner && <th>Owner</th>}
                <th>Team</th>
                <th className="num">Rank</th>
                <th className="num">W-L</th>
                <th className="num">Playoffs</th>
                <th className="num">PF</th>
                <th className="num">Luck</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const luck = luckRating(r)
                const po = playoffRecordFor(r.season, r.manager)
                return (
                  <tr key={r.season}>
                    <td style={{ fontWeight: 700 }}>{r.season}</td>
                    {c.isMultiOwner && (
                      <td>
                        <ManagerLink manager={r.manager} />
                      </td>
                    )}
                    <td className="muted">{r.team}</td>
                    <td className="num">{r.reg_season_rank}</td>
                    <td className="num">
                      {r.w}-{r.l}
                    </td>
                    <td className="num muted">
                      {po.wins + po.losses > 0 ? `${po.wins}-${po.losses}` : '—'}
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

      <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
        {c.isMultiOwner
          ? 'Per-game logs and personal career stats live on each owner’s individual page, linked above.'
          : 'This franchise has had one owner for its entire history — see their full career page:'}{' '}
        {!c.isMultiOwner && <ManagerLink manager={c.owners[0]} />}
      </p>
    </>
  )
}
