import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StatCard } from '../components/StatCard'
import { ResultBadge } from '../components/ResultBadge'
import {
  MANAGER_IDENTITY,
  MANAGERS,
  MATCHUP_LOG,
  SEASONS,
  displayName,
  playoffRecordFor,
} from '../data/league'
import { BADGE_BY_MANAGER } from '../data/badges'
import { ManagerLink } from '../components/ManagerLink'
import { careerStats, luckRating, winPct as winPctOf } from '../lib/stats'
import { rivalryFor, type RivalryOpponent } from '../lib/h2h'
import { careerLuck } from '../lib/luck'
import { franchisesForManager } from '../lib/franchise'
import { num, pct, record, signedPct } from '../lib/format'

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
  const initials = displayName(manager).slice(0, 2).toUpperCase()
  const rivalry = rivalryFor(manager)
  const allPlayLuck = careerLuck().find((c) => c.manager === manager)
  const franchises = franchisesForManager(manager)

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
      {franchises.map((franchise) => {
        const franchiseEra = franchise.owners.find((o) => o.manager === manager)!
        const idx = franchise.owners.indexOf(franchiseEra)
        const predecessor = franchise.owners[idx - 1]
        const successor = franchise.owners[idx + 1]
        return (
          <p
            key={franchise.id}
            className="note callout"
            style={{ marginTop: 12, maxWidth: '70ch' }}
          >
            This seat has had more than one owner.{' '}
            {predecessor && (
              <>
                Before {displayName(manager)}, it belonged to{' '}
                <ManagerLink manager={predecessor.manager} />.{' '}
              </>
            )}
            {successor && (
              <>
                After {displayName(manager)}, it passed to{' '}
                <ManagerLink manager={successor.manager} />.{' '}
              </>
            )}
            See the <Link to={`/franchises/${franchise.id}`}>full franchise history →</Link>
          </p>
        )
      })}

      <section className="section">
        <div className="grid stat-grid">
          <StatCard label="Championships" value={c.championships} />
          <StatCard
            label="Career Record"
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
          <StatCard
            label="Avg Luck Rating"
            value={
              <span className={c.avgLuck >= 0 ? 'pos' : 'neg'}>{signedPct(c.avgLuck)}</span>
            }
            meta="actual vs. Pythagorean-expected win %"
          />
          {allPlayLuck && (
            <StatCard
              label="Career Luck Index"
              value={
                <span className={allPlayLuck.luck >= 0 ? 'pos' : 'neg'}>
                  {allPlayLuck.luck >= 0 ? '+' : ''}
                  {num(allPlayLuck.luck, 2)}
                </span>
              }
              meta={
                <>
                  actual wins vs. all-play — a different metric, see the{' '}
                  <Link to="/luck">full Luck Index →</Link>
                </>
              }
            />
          )}
        </div>
      </section>

      {(rivalry.toughest || rivalry.favorite) && (
        <section className="section">
          <div className="row-between">
            <h2 className="section-title">Rivalries</h2>
            <Link to="/rivalries" className="muted" style={{ fontSize: 13 }}>
              All rivalries →
            </Link>
          </div>
          <div className="grid stat-grid">
            {rivalry.toughest && (
              <RivalryCard label="Toughest Opponent" manager={manager} rival={rivalry.toughest} />
            )}
            {rivalry.favorite && (
              <RivalryCard label="Favorite Opponent" manager={manager} rival={rivalry.favorite} />
            )}
          </div>
        </section>
      )}

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

      <GameLog manager={manager} />

      <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
        See also: <Link to="/luck">Luck Index</Link> · <Link to="/draft-grades">Draft Report Card</Link>{' '}
        · <Link to="/trades">Trade History</Link> · <Link to="/franchises">Franchises</Link>
      </p>
    </>
  )
}

function GameLog({ manager }: { manager: string }) {
  const games = useMemo(
    () => MATCHUP_LOG.filter((g) => g.manager === manager),
    [manager],
  )
  const seasonsPlayed = useMemo(
    () => [...new Set(games.map((g) => g.season))].sort((a, b) => b - a),
    [games],
  )

  // Track the selected season alongside the manager it was picked for, so switching
  // to a manager who never played that season (or has a shorter career) falls back
  // to their most recent season instead of rendering an empty table.
  const [picked, setPicked] = useState<{ manager: string; season: number } | null>(null)
  const selectedSeason =
    picked && picked.manager === manager && seasonsPlayed.includes(picked.season)
      ? picked.season
      : seasonsPlayed[0]

  if (seasonsPlayed.length === 0 || selectedSeason === undefined) {
    return null
  }

  // Playoff weeks overlap regular-season week numbers across eras (e.g. week 14 can be
  // either), so order by phase first and week second rather than sorting on week alone.
  const seasonGames = games
    .filter((g) => g.season === selectedSeason)
    .sort((a, b) => {
      if (a.phase !== b.phase) return a.phase === 'regular' ? -1 : 1
      return a.week - b.week
    })

  const regular = seasonGames.filter((g) => g.phase === 'regular')
  const playoffs = seasonGames.filter((g) => g.phase === 'playoff' && !g.consolation)
  const consolation = seasonGames.filter((g) => g.consolation)
  const recordOf = (list: typeof seasonGames) => {
    const w = list.filter((g) => g.result === 'W').length
    const l = list.filter((g) => g.result === 'L').length
    const t = list.filter((g) => g.result === 'T').length
    return t > 0 ? `${w}-${l}-${t}` : `${w}-${l}`
  }
  const summary = [
    regular.length > 0 ? `${recordOf(regular)} regular season` : null,
    playoffs.length > 0 ? `${recordOf(playoffs)} playoffs` : null,
    consolation.length > 0 ? `${recordOf(consolation)} consolation` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <section className="section">
      <h2 className="section-title">Game Log</h2>
      <div className="row-between" style={{ marginBottom: 16 }}>
        <select
          className="select"
          value={selectedSeason}
          onChange={(e) => setPicked({ manager, season: Number(e.target.value) })}
        >
          {seasonsPlayed.map((s) => (
            <option key={s} value={s}>
              {s} Season
            </option>
          ))}
        </select>
        {summary && <span className="muted">{summary}</span>}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th className="num">Week</th>
              <th>Opponent</th>
              <th className="num">Score</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {seasonGames.map((g, i) => {
              const firstPlayoffGame = g.phase === 'playoff' && seasonGames[i - 1]?.phase === 'regular'
              return (
                <tr
                  key={`${g.season}-${g.phase}-${g.week}`}
                  style={firstPlayoffGame ? { borderTop: '2px solid var(--line)' } : undefined}
                >
                  <td className="num">{g.week}</td>
                  <td>
                    <ManagerLink manager={g.opponent} />
                    {g.phase === 'playoff' && (
                      <span className="chip" style={{ marginLeft: 8 }}>
                        {g.consolation ? 'Consolation' : 'Playoffs'}
                      </span>
                    )}
                  </td>
                  <td className="num">
                    {num(g.pf)} – {num(g.pa)}
                  </td>
                  <td className={g.result === 'T' ? 'muted' : g.result === 'W' ? 'pos' : 'neg'}>
                    {g.result}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function RivalryCard({
  label,
  manager,
  rival,
}: {
  label: string
  manager: string
  rival: RivalryOpponent
}) {
  const games = rival.w + rival.l + rival.t
  const winRate = games === 0 ? 0 : (rival.w + rival.t * 0.5) / games
  return (
    <Link
      to={`/rivalries/${manager}/${rival.opponent}`}
      className="card stat"
      style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
    >
      <div className="label">{label}</div>
      <div className="value">
        vs <ManagerLink manager={rival.opponent} plain />
      </div>
      <div className="meta">
        {record(rival.w, rival.l, rival.t)} ({pct(winRate)}) · full rivalry →
      </div>
    </Link>
  )
}
