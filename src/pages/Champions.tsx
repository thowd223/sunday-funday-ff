import { ManagerLink } from '../components/ManagerLink'
import { SEASONS } from '../data/league'
import { seasonPodiums } from '../lib/stats'
import { num } from '../lib/format'

export function Champions() {
  const podiums = [...seasonPodiums()].reverse()

  const teamOf = (season: number, manager?: string) =>
    manager
      ? SEASONS.find((r) => r.season === season && r.manager === manager)?.team ?? ''
      : ''

  return (
    <>
      <div className="eyebrow">The Trophy Case</div>
      <h1 className="page-title">Season Champions</h1>
      <p className="page-sub">
        Every title winner and the full podium for each season. Champions from 2019 on come
        straight from Sleeper's completed winners bracket; earlier years are derived from the
        ESPN-era final standings.
      </p>

      <div className="section" style={{ marginTop: 24 }}>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
          {podiums.map((p) => {
            const champTeam = teamOf(p.season, p.champion)
            const champRow = SEASONS.find(
              (r) => r.season === p.season && r.manager === p.champion,
            )
            return (
              <div className="card stat" key={p.season}>
                <div className="row-between">
                  <div className="label">{p.season}</div>
                  <span className="pill result-champion">🏆 Champion</span>
                </div>
                <div className="value" style={{ fontSize: 24, marginTop: 10 }}>
                  {p.champion && <ManagerLink manager={p.champion} />}
                </div>
                <div className="meta">{champTeam}</div>
                {champRow && (
                  <div className="meta">
                    {champRow.w}-{champRow.l} · {num(champRow.pf)} PF
                  </div>
                )}
                <div style={{ marginTop: 14, display: 'grid', gap: 6, fontSize: 13 }}>
                  <div className="row-between">
                    <span className="muted">🥈 Runner-Up</span>
                    <span>{p.runnerUp && <ManagerLink manager={p.runnerUp} />}</span>
                  </div>
                  <div className="row-between">
                    <span className="muted">🥉 3rd Place</span>
                    <span>{p.third && <ManagerLink manager={p.third} />}</span>
                  </div>
                  <div className="row-between">
                    <span className="muted">4th Place</span>
                    <span>{p.fourth && <ManagerLink manager={p.fourth} />}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
