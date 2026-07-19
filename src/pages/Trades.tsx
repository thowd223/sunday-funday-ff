import { useMemo } from 'react'
import { displayName } from '../data/league'
import { ManagerLink } from '../components/ManagerLink'
import { StatCard } from '../components/StatCard'
import {
  TRADE_SEASONS,
  leagueTradeTotals,
  traderProfilesRanked,
  tradePartnerships,
  blockbusterTrades,
  tradesByWeekBucket,
  titleTeamTrades,
  type FlatTrade,
} from '../lib/trades'
import { int } from '../lib/format'

/** One party's haul within a trade card — "who got what," unambiguous. */
function PartyHaul({ manager, received }: { manager: string; received: string[] }) {
  return (
    <div>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>
        <ManagerLink manager={manager} /> <span className="muted">received</span>
      </div>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: 'var(--text-dim)' }}>
        {received.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

/** A single trade rendered as a two-(or more-)column "who got what" card. */
function TradeCard({ ft }: { ft: FlatTrade }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="row-between" style={{ marginBottom: 12 }}>
        <span className="chip">
          {ft.season} · Week {ft.week}
        </span>
        <span className="muted" style={{ fontSize: 12 }}>
          {ft.totalAssets} asset{ft.totalAssets === 1 ? '' : 's'} moved
        </span>
      </div>
      <div
        className="grid"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))' }}
      >
        {ft.trade.parties.map((party, i) => (
          <PartyHaul key={i} manager={party.manager} received={party.received} />
        ))}
      </div>
    </div>
  )
}

export function Trades() {
  const totals = useMemo(() => leagueTradeTotals(), [])
  const traders = useMemo(() => traderProfilesRanked(), [])
  const partnerships = useMemo(() => tradePartnerships(), [])
  const blockbusters = useMemo(() => blockbusterTrades(8), [])
  const weekBuckets = useMemo(() => tradesByWeekBucket(), [])
  const titleTrades = useMemo(() => titleTeamTrades(), [])

  const activeTraders = traders.filter((t) => t.totalTrades > 0)
  const inactiveTraders = traders.filter((t) => t.totalTrades === 0)
  const topPartnership = partnerships[0]
  const maxWeekCount = Math.max(1, ...weekBuckets.map((b) => b.count))

  return (
    <>
      <div className="eyebrow">The Market</div>
      <h1 className="page-title">Trade History</h1>
      <p className="page-sub">
        Every completed trade the league has made, pulled from Sleeper's transactions API —{' '}
        {TRADE_SEASONS[0]}–{TRADE_SEASONS[TRADE_SEASONS.length - 1]}. Sleeper era only:
        ESPN's API no longer serves transaction history for 2012–2018, so those seasons aren't
        shown as trade-free — they're simply undocumented. Nothing here reflects the years
        before the league moved to Sleeper.
      </p>

      <section className="section">
        <div className="grid stat-grid">
          <StatCard label="Total Trades" value={int(totals.totalTrades)} meta={`${TRADE_SEASONS.length} seasons tracked`} />
          <StatCard
            label="Most Active Season"
            value={totals.mostActiveSeason ? totals.mostActiveSeason.season : '—'}
            meta={totals.mostActiveSeason ? `${int(totals.mostActiveSeason.count)} trades` : undefined}
          />
          <StatCard
            label="Most Active Trader"
            value={activeTraders[0] ? displayName(activeTraders[0].manager) : '—'}
            meta={activeTraders[0] ? `${int(activeTraders[0].totalTrades)} trades` : undefined}
          />
          <StatCard
            label="Top Partnership"
            value={
              topPartnership ? (
                <span style={{ fontSize: 20 }}>
                  {displayName(topPartnership.a)} <span className="muted">×</span>{' '}
                  {displayName(topPartnership.b)}
                </span>
              ) : (
                '—'
              )
            }
            meta={topPartnership ? `${int(topPartnership.count)} trades together` : undefined}
          />
        </div>
        <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
          Trades per season: {totals.bySeason.map((s) => `${s.season}: ${s.count}`).join(' · ')}.
          {totals.leastActiveSeason && totals.leastActiveSeason.count === 0 && (
            <> {totals.leastActiveSeason.season} saw zero completed trades.</>
          )}
        </p>
      </section>

      <section className="section">
        <h2 className="section-title">💣 Blockbusters</h2>
        <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
          The biggest trades by total assets changing hands, both sides combined.
        </p>
        {blockbusters.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {blockbusters.map((ft, i) => (
              <TradeCard key={`${ft.season}-${ft.week}-${i}`} ft={ft} />
            ))}
          </div>
        ) : (
          <p className="muted">No trades recorded.</p>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">🧑‍💼 Trader Leaderboard</h2>
        <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
          Every manager, ranked by trades made. Assets acquired/shipped count players, defenses,
          draft picks, and FAAB dollars received or sent away in each deal.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Manager</th>
                <th className="num">Trades</th>
                <th className="num">Assets Acquired</th>
                <th className="num">Assets Shipped</th>
                <th>Top Partner</th>
              </tr>
            </thead>
            <tbody>
              {traders.map((t, i) => (
                <tr key={t.manager}>
                  <td className="muted">{i + 1}</td>
                  <td>
                    <ManagerLink manager={t.manager} />
                  </td>
                  <td className="num">{int(t.totalTrades)}</td>
                  <td className="num">{int(t.assetsAcquired)}</td>
                  <td className="num">{int(t.assetsShipped)}</td>
                  <td>
                    {t.topPartner ? (
                      <>
                        <ManagerLink manager={t.topPartner.manager} plain /> (
                        {int(t.topPartner.count)})
                      </>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {inactiveTraders.length > 0 && (
          <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
            Never picks up the phone:{' '}
            {inactiveTraders.map((t, i) => (
              <span key={t.manager}>
                <ManagerLink manager={t.manager} plain />
                {i < inactiveTraders.length - 1 ? ', ' : ''}
              </span>
            ))}{' '}
            — zero recorded trades in the Sleeper era.
          </p>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">🤝 Trade Partnerships</h2>
        <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
          Which pairs of managers do business with each other most often.
        </p>
        {partnerships.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pair</th>
                  <th className="num">Trades</th>
                </tr>
              </thead>
              <tbody>
                {partnerships.slice(0, 12).map((p) => (
                  <tr key={`${p.a}-${p.b}`}>
                    <td>
                      <ManagerLink manager={p.a} plain /> <span className="muted">×</span>{' '}
                      <ManagerLink manager={p.b} plain />
                    </td>
                    <td className="num">{int(p.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">No trade partnerships recorded.</p>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">📅 Deadline Behavior</h2>
        <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
          When trades actually happen — bucketed by week of the season.
        </p>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {weekBuckets.map((b) => (
              <div key={b.label}>
                <div className="row-between" style={{ marginBottom: 4, fontSize: 13 }}>
                  <span>{b.label}</span>
                  <span className="muted">{int(b.count)}</span>
                </div>
                <div className="progress">
                  <span style={{ width: `${(b.count / maxWeekCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">🏆 Trades That "Won" Titles</h2>
        <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
          Moves made by the teams that reached that season's title game — the Champion and
          Runner-Up. A correlation worth noting, not a claim that any single trade decided a
          title.
        </p>
        {titleTrades.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {titleTrades.map((tt) => (
              <div key={tt.season}>
                <div className="row-between" style={{ marginBottom: 10 }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{tt.season}</h3>
                  <span className="muted" style={{ fontSize: 13 }}>
                    Champion <ManagerLink manager={tt.champion} plain />
                    {tt.runnerUp && (
                      <>
                        {' '}
                        · Runner-Up <ManagerLink manager={tt.runnerUp} plain />
                      </>
                    )}
                  </span>
                </div>
                {tt.trades.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {tt.trades.map((ft, i) => (
                      <TradeCard key={`${ft.season}-${ft.week}-${i}`} ft={ft} />
                    ))}
                  </div>
                ) : (
                  <p className="muted" style={{ fontSize: 13 }}>
                    Neither the Champion nor Runner-Up made a trade this season.
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No title-season data available.</p>
        )}
      </section>
    </>
  )
}
