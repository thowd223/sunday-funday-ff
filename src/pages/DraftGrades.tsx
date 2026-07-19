import { useMemo } from 'react'
import { ManagerLink } from '../components/ManagerLink'
import { ResultBadge } from '../components/ResultBadge'
import { StatCard } from '../components/StatCard'
import { SEASON_YEARS, displayName } from '../data/league'
import {
  POSITION_ERA_SEASONS,
  draftDayLoyalty,
  draftSlotVsDestiny,
  earliestByPosition,
  firstPickEverWon,
  firstPickLedger,
  hasKeeperData,
  mostDraftedPlayers,
  positionalTendencies,
  round1Outcomes,
} from '../lib/draftGrades'
import { int, num, pct } from '../lib/format'

// Preferred column order for the position-tendency pivot — cosmetic only,
// falls back to alphabetical for anything not in this list.
const POSITION_ORDER = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF']

export function DraftGrades() {
  const ledger = useMemo(() => firstPickLedger(), [])
  const oneOhOneWon = useMemo(() => firstPickEverWon(ledger), [ledger])

  const loyalty = useMemo(() => draftDayLoyalty(10), [])
  const mostDrafted = useMemo(() => mostDraftedPlayers(10), [])

  const extremes = useMemo(() => earliestByPosition(), [])
  const tendencies = useMemo(() => positionalTendencies(), [])

  const positions = useMemo(() => {
    const present = new Set(tendencies.map((t) => t.position))
    const ordered = POSITION_ORDER.filter((p) => present.has(p))
    const rest = [...present].filter((p) => !POSITION_ORDER.includes(p)).sort()
    return [...ordered, ...rest]
  }, [tendencies])

  const tendencyByManager = useMemo(() => {
    const map = new Map<string, Map<string, { avgRound: number; n: number }>>()
    for (const t of tendencies) {
      const row = map.get(t.manager) ?? new Map()
      row.set(t.position, { avgRound: t.avgRound, n: t.n })
      map.set(t.manager, row)
    }
    return [...map.entries()].sort((a, b) => displayName(a[0]).localeCompare(displayName(b[0])))
  }, [tendencies])

  const round1 = useMemo(() => round1Outcomes(), [])
  const slots = useMemo(() => draftSlotVsDestiny(), [])
  const keeperDataExists = useMemo(() => hasKeeperData(), [])

  const positionEraLabel =
    POSITION_ERA_SEASONS.length > 0
      ? `${POSITION_ERA_SEASONS[0]}–${POSITION_ERA_SEASONS[POSITION_ERA_SEASONS.length - 1]}`
      : 'no seasons'

  return (
    <>
      <div className="eyebrow">The War Room</div>
      <h1 className="page-title">Draft Report Card</h1>
      <p className="page-sub">
        Fourteen drafts, {int(SEASON_YEARS.length)} seasons of results to grade them against.
        Everything below is computed straight from the league's own draft boards and standings —
        no outside player rankings, no hindsight grades. Two coverage notes up front: ESPN-era
        boards (2012–2018) never recorded player position, so anything position-based below is
        scoped to the Sleeper era ({positionEraLabel}); and this league has never run keepers —
        every `keeper` flag in the dataset checks out false — so there's no keeper-usage section
        here at all.
      </p>

      <section className="section">
        <div className="grid stat-grid">
          <StatCard label="Drafts on Record" value={SEASON_YEARS.length} meta="2012 – 2025" />
          <StatCard
            label="1.01 Championships"
            value={ledger.filter((e) => e.result === 'Champion').length}
            meta={`out of ${ledger.length} #1-overall picks`}
          />
          <StatCard
            label="Most-Drafted Player"
            value={mostDrafted[0]?.player ?? '—'}
            meta={`${mostDrafted[0]?.count ?? 0} times, ${mostDrafted[0]?.managers.length ?? 0} different managers`}
          />
          <StatCard
            label="Biggest Draft-Day Loyalist"
            value={loyalty[0] ? displayName(loyalty[0].manager) : '—'}
            meta={loyalty[0] ? `${loyalty[0].player}, ${loyalty[0].seasons.length} seasons` : ''}
          />
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">🎯 The Curse of the 1.01</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
          Every #1-overall pick in league history, and how that manager's season actually ended.{' '}
          {oneOhOneWon ? (
            <>The 1.01 <span className="pos">has</span> won it all before.</>
          ) : (
            <>
              The 1.01 has <span className="neg">never once</span> turned into a championship —
              the best it's managed is a podium finish.
            </>
          )}
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Season</th>
                <th>Manager</th>
                <th>Player</th>
                <th>Position</th>
                <th className="num">Final Rank</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((e) => (
                <tr key={e.season}>
                  <td className="muted">{e.season}</td>
                  <td>
                    <ManagerLink manager={e.manager} />
                  </td>
                  <td>{e.player}</td>
                  <td className="muted">{e.position ?? '—'}</td>
                  <td className="num">{e.reg_season_rank}</td>
                  <td>
                    <ResultBadge result={e.result} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">🤝 His Guy</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
          Players the same manager kept coming back to draft, season after season — and,
          separately, the players the whole league couldn't stop taking regardless of who was on
          the clock.
        </p>
        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(420px, 100%),1fr))' }}
        >
          <div>
            <h3 style={{ fontSize: 15, color: 'var(--gold-soft)', marginBottom: 8 }}>
              Draft-Day Loyalty
            </h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Manager</th>
                    <th>Player</th>
                    <th className="num">Seasons</th>
                    <th>Years Drafted</th>
                  </tr>
                </thead>
                <tbody>
                  {loyalty.map((l) => (
                    <tr key={`${l.manager}-${l.player}`}>
                      <td>
                        <ManagerLink manager={l.manager} />
                      </td>
                      <td>{l.player}</td>
                      <td className="num">{l.seasons.length}</td>
                      <td className="muted">{l.seasons.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: 15, color: 'var(--gold-soft)', marginBottom: 8 }}>
              League-Wide Favorites
            </h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Player</th>
                    <th className="num">Times Drafted</th>
                    <th className="num">Different Managers</th>
                  </tr>
                </thead>
                <tbody>
                  {mostDrafted.map((p) => (
                    <tr key={p.player}>
                      <td>{p.player}</td>
                      <td className="num">{p.count}</td>
                      <td className="num">{p.managers.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">🧭 Positional Tendencies</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
          Sleeper-era only ({positionEraLabel}) — ESPN-era boards didn't record position, so
          mixing eras here would understate everyone's early rounds. First column set shows each
          manager's average draft round by position; below that, the earliest the league has ever
          taken each position.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Manager</th>
                {positions.map((p) => (
                  <th key={p} className="num">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tendencyByManager.map(([manager, row]) => (
                <tr key={manager}>
                  <td>
                    <ManagerLink manager={manager} />
                  </td>
                  {positions.map((p) => {
                    const cell = row.get(p)
                    return (
                      <td key={p} className="num muted" title={cell ? `n=${cell.n}` : undefined}>
                        {cell ? num(cell.avgRound, 1) : '—'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted" style={{ margin: '16px 0 8px', fontSize: 13 }}>
          Average draft round — lower is earlier. Hover a cell for sample size.
        </p>

        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table>
            <thead>
              <tr>
                <th>Position</th>
                <th>Earliest Pick</th>
                <th>Season</th>
                <th>Manager</th>
                <th>Player</th>
              </tr>
            </thead>
            <tbody>
              {extremes.map((e) => (
                <tr key={e.position}>
                  <td className="muted">{e.position}</td>
                  <td className="num">
                    Rd {e.round}, pick {e.overall} overall
                  </td>
                  <td className="muted">{e.season}</td>
                  <td>
                    <ManagerLink manager={e.manager} />
                  </td>
                  <td>{e.player}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">🥇 Round-1 Report Card</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
          Every manager's round-1 picks, and how often the resulting season made the playoffs.
          Treat this as a correlation, not a verdict — a whole season of waiver claims, trades,
          and matchups sits between one first-round pick and a playoff berth.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Manager</th>
                <th className="num">Round-1 Picks</th>
                <th className="num">Playoff Seasons</th>
                <th className="num">Hit Rate</th>
              </tr>
            </thead>
            <tbody>
              {round1.map((r) => (
                <tr key={r.manager}>
                  <td>
                    <ManagerLink manager={r.manager} />
                  </td>
                  <td className="num">{r.n}</td>
                  <td className="num">{r.madePlayoffsCount}</td>
                  <td className={`num ${r.hitRate >= 0.5 ? 'pos' : 'neg'}`}>{pct(r.hitRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">🎲 Draft Slot vs. Destiny</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
          Average final regular-season rank and playoff-berth rate, grouped by round-1 draft slot
          across all 14 seasons. Lower average rank is better. The league has run at both 10 and
          12 teams, so sample sizes (n) shrink at the outer slots — read those with a grain of
          salt.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="num">Slot</th>
                <th className="num">n</th>
                <th className="num">Avg Final Rank</th>
                <th className="num">Made Playoffs %</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((s) => (
                <tr key={s.slot}>
                  <td className="num">{s.slot}</td>
                  <td className="num muted">{s.n}</td>
                  <td className="num">{num(s.avgRank, 2)}</td>
                  <td className="num">{pct(s.playoffPct, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {!keeperDataExists && (
        <p className="muted" style={{ marginTop: 24, fontSize: 13 }}>
          No keeper-usage section: checked every draft on record and the `keeper` flag has never
          been true.
        </p>
      )}
    </>
  )
}
