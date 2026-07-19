import { Link, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { MANAGERS, displayName } from '../data/league'
import { ManagerLink } from '../components/ManagerLink'
import { StatCard } from '../components/StatCard'
import { rivalryStats, type RivalryStats } from '../lib/rivalry'
import { num, pct, record } from '../lib/format'

export function RivalryDetail() {
  const { a = '', b = '' } = useParams()

  const valid = a !== b && MANAGERS.includes(a) && MANAGERS.includes(b)

  if (!valid) {
    return (
      <>
        <div className="eyebrow">Grudges</div>
        <h1 className="page-title">No such rivalry</h1>
        <p className="page-sub">
          {a === b
            ? "A manager can't have a rivalry with themselves."
            : `We don't have records for "${a}" vs. "${b}".`}{' '}
          <Link to="/rivalries">Back to all rivalries →</Link>
        </p>
      </>
    )
  }

  return <RivalryDetailBody a={a} b={b} />
}

function RivalryDetailBody({ a, b }: { a: string; b: string }) {
  const stats = useMemo(() => rivalryStats(a, b), [a, b])
  const meetings = stats.meetings
  const totalMeetings = stats.allTime.wins + stats.allTime.losses + stats.allTime.ties

  return (
    <>
      <Link to="/rivalries" className="muted" style={{ fontSize: 13 }}>
        ← All rivalries
      </Link>

      <div className="eyebrow" style={{ marginTop: 16 }}>
        Grudges
      </div>
      <h1 className="page-title">
        {displayName(a)} <span className="muted">vs.</span> {displayName(b)}
      </h1>
      <p className="page-sub">{recordHeadline(stats)}</p>

      {totalMeetings === 0 ? (
        <p className="muted" style={{ marginTop: 24 }}>
          These two have never met — no scheduled games between {displayName(a)} and{' '}
          {displayName(b)} yet.
        </p>
      ) : (
        <>
          <section className="section">
            <div className="grid stat-grid">
              <StatCard label="All-Time Meetings" value={totalMeetings} meta={seasonSpan(stats)} />
              <StatCard label="Current Streak" value={streakLabel(stats)} />
              <StatCard
                label="Biggest Blowout"
                value={stats.biggestBlowout ? num(marginOf(stats.biggestBlowout)) : '—'}
                meta={stats.biggestBlowout ? meetingSummary(stats, stats.biggestBlowout) : undefined}
              />
              <StatCard
                label="Closest Game"
                value={stats.closestGame ? num(marginOf(stats.closestGame)) : stats.hasTies ? 'Tie' : '—'}
                meta={stats.closestGame ? meetingSummary(stats, stats.closestGame) : undefined}
              />
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">Postseason History</h2>
            {stats.eliminations.length === 0 ? (
              <p className="note callout">
                These two have never met in the playoffs
                {stats.playoff.wins + stats.playoff.losses + stats.playoff.ties > 0
                  ? ' with a bracket spot on the line — their postseason meetings so far have all been placement or consolation games.'
                  : '. All business, no bloodshed — yet.'}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stats.eliminations.map((e) => (
                  <div
                    key={`${e.season}-${e.week}`}
                    className="card"
                    style={{ padding: '14px 18px' }}
                  >
                    <span className="chip" style={{ marginRight: 10 }}>
                      {e.season} {e.roundLabel}
                    </span>
                    <ManagerLink manager={e.winner} /> ended{' '}
                    <ManagerLink manager={e.loser} />
                    's season, {num(e.pfWinner)}–{num(e.pfLoser)}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="section">
            <h2 className="section-title">Regular Season vs. Playoffs</h2>
            <div className="grid stat-grid">
              <StatCard
                label="Regular Season"
                value={record(stats.regularSeason.wins, stats.regularSeason.losses, stats.regularSeason.ties)}
                meta={`${displayName(a)}'s record vs. ${displayName(b)}`}
              />
              <StatCard
                label="Playoffs"
                value={record(stats.playoff.wins, stats.playoff.losses, stats.playoff.ties)}
                meta={
                  stats.playoff.wins + stats.playoff.losses + stats.playoff.ties > 0
                    ? `${displayName(a)}'s record vs. ${displayName(b)}`
                    : 'No playoff meetings'
                }
              />
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">Full Meeting Log</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Season</th>
                    <th>Week</th>
                    <th>Phase</th>
                    <th className="num">Score</th>
                    <th>Winner</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.map((m) => (
                    <tr key={`${m.season}-${m.week}-${m.phase}`}>
                      <td style={{ fontWeight: 700 }}>{m.season}</td>
                      <td>{m.week}</td>
                      <td>
                        {m.phase === 'playoff' ? (
                          <span className="chip">
                            {m.championshipPath
                              ? m.roundLabel
                              : m.consolation
                                ? 'Consolation'
                                : 'Placement'}
                          </span>
                        ) : (
                          <span className="muted">Regular</span>
                        )}
                      </td>
                      <td className="num">
                        {num(m.pf)} – {num(m.pa)}
                      </td>
                      <td className={m.result === 'T' ? 'muted' : m.result === 'W' ? 'pos' : 'neg'}>
                        {m.result === 'T' ? (
                          'Tie'
                        ) : (
                          <ManagerLink manager={m.result === 'W' ? a : b} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  )
}

function marginOf(m: { pf: number; pa: number }): number {
  return Math.abs(m.pf - m.pa)
}

function meetingSummary(
  stats: RivalryStats,
  m: { season: number; week: number; pf: number; pa: number },
): string {
  return `${displayName(stats.a)} ${num(m.pf)}–${num(m.pa)} ${displayName(stats.b)}, ${m.season} Wk ${m.week}`
}

function seasonSpan(stats: RivalryStats): string | undefined {
  if (stats.meetings.length === 0) return undefined
  const first = stats.meetings[0].season
  const last = stats.meetings[stats.meetings.length - 1].season
  return first === last ? `${first}` : `${first}–${last}`
}

function streakLabel(stats: RivalryStats): string {
  if (!stats.currentStreak) return 'Tied last meeting'
  const { manager, count } = stats.currentStreak
  if (count <= 1) return `${displayName(manager)} won the last meeting`
  return `${displayName(manager)} has won ${count} straight`
}

/** Unambiguous, a-side-first headline: "DisplayA leads the series 9-5-1 (64.3%)." */
function recordHeadline(stats: RivalryStats): string {
  const { a, b, allTime } = stats
  const total = allTime.wins + allTime.losses + allTime.ties
  if (total === 0) return `${displayName(a)} and ${displayName(b)} haven't played yet.`
  if (allTime.wins === allTime.losses) {
    return `Series tied ${record(allTime.wins, allTime.losses, allTime.ties)} between ${displayName(a)} and ${displayName(b)}.`
  }
  const winPct = (allTime.wins + allTime.ties * 0.5) / total
  return `${displayName(a)} leads the all-time series ${record(allTime.wins, allTime.losses, allTime.ties)} (${pct(winPct)}) over ${displayName(b)}.`
}
