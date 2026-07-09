import { ManagerLink } from '../components/ManagerLink'
import { BADGE_BY_MANAGER } from '../data/badges'
import { allCareerStats } from '../lib/stats'
import { pct } from '../lib/format'

export function Managers() {
  const careers = [...allCareerStats()].sort(
    (a, b) => b.championships - a.championships || b.winPct - a.winPct,
  )

  return (
    <>
      <div className="eyebrow">The Managers</div>
      <h1 className="page-title">All Managers</h1>
      <p className="page-sub">Everyone who's ever managed a team in the league.</p>

      <div
        className="section grid"
        style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}
      >
        {careers.map((c) => {
          const badge = BADGE_BY_MANAGER[c.manager]
          return (
            <div className="card stat" key={c.manager}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                <ManagerLink manager={c.manager} />
              </div>
              {badge && <div className="badge-tag" style={{ fontSize: 13 }}>{badge.badge}</div>}
              <div className="chips">
                <span className="chip">🏆 {c.championships}</span>
                <span className="chip">
                  {c.wins}-{c.losses}
                </span>
                <span className="chip">{pct(c.winPct)}</span>
                <span className="chip">{c.seasons} seasons</span>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
