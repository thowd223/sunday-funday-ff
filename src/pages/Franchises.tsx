import { FranchiseLink } from '../components/FranchiseLink'
import { ManagerLink } from '../components/ManagerLink'
import { allFranchiseCareerStats } from '../lib/franchise'
import { pct } from '../lib/format'

export function Franchises() {
  const franchises = [...allFranchiseCareerStats()].sort(
    (a, b) => b.championships - a.championships || b.winPct - a.winPct,
  )

  return (
    <>
      <div className="eyebrow">The Franchises</div>
      <h1 className="page-title">All Franchises</h1>
      <p className="page-sub">
        Every competitive seat the league has ever fielded, tracked by seat rather than by
        person — most franchises have had exactly one owner for their entire history, but a
        few changed hands. Those are marked below; each links through to the individual
        managers who held the seat.
      </p>

      <div
        className="section grid"
        style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}
      >
        {franchises.map((f) => (
          <div className="card stat" key={f.id}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              <FranchiseLink id={f.id} />
            </div>
            {f.isMultiOwner ? (
              <div className="muted" style={{ fontSize: 13 }}>
                {f.owners.map((o, idx) => (
                  <span key={o}>
                    {idx > 0 && ' → '}
                    <ManagerLink manager={o} plain />
                  </span>
                ))}
              </div>
            ) : (
              <div className="muted" style={{ fontSize: 13 }}>
                Single owner throughout
              </div>
            )}
            <div className="chips">
              <span className="chip">🏆 {f.championships}</span>
              <span className="chip">
                {f.wins}-{f.losses}
              </span>
              <span className="chip">{pct(f.winPct)}</span>
              <span className="chip">{f.seasons} seasons</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
