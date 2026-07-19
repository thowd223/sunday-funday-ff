import { RECAPS } from '../data/recaps'

/**
 * The app uses HashRouter (URL fragment = route), so a plain `href="#season-2012"`
 * anchor would be read as a route change, not an in-page jump. Scroll manually instead.
 */
function jumpTo(season: number) {
  document.getElementById(`season-${season}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function Stories() {
  return (
    <>
      <div className="eyebrow">The Chronicle</div>
      <h1 className="page-title">Season Stories</h1>
      <p className="page-sub">
        Fourteen years of Sunday Funday, told season by season — every champion's run, every
        collapse, and the numbers behind them. Sorted oldest to newest, so the story reads the
        way it happened.
      </p>

      <nav className="section" aria-label="Jump to season" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {RECAPS.map((r) => (
            <button
              key={r.season}
              type="button"
              className="chip"
              onClick={() => jumpTo(r.season)}
              style={{ cursor: 'pointer', font: 'inherit' }}
            >
              {r.season}
            </button>
          ))}
        </div>
      </nav>

      {RECAPS.map((r) => (
        <section key={r.season} id={`season-${r.season}`} className="section" style={{ scrollMarginTop: 84 }}>
          <div className="card" style={{ padding: 'clamp(20px, 4vw, 32px)' }}>
            <div className="row-between" style={{ alignItems: 'flex-start', gap: 16 }}>
              <div>
                <div className="eyebrow">{r.season} Season</div>
                <h2 style={{ fontSize: 'clamp(22px, 3.4vw, 30px)', fontWeight: 800, marginTop: 6 }}>
                  {r.headline}
                </h2>
                {r.subhead && (
                  <p className="muted" style={{ marginTop: 8, fontSize: 15, lineHeight: 1.5, maxWidth: '68ch' }}>
                    {r.subhead}
                  </p>
                )}
              </div>
              <div
                style={{
                  fontSize: 'clamp(32px, 5vw, 44px)',
                  fontWeight: 900,
                  color: 'var(--gold)',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                {r.season}
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {r.paragraphs.map((p, i) => (
                <p key={i} style={{ lineHeight: 1.7, fontSize: 15 }}>
                  {p}
                </p>
              ))}
            </div>

            {r.keyMoments && r.keyMoments.length > 0 && (
              <div
                className="grid"
                style={{
                  marginTop: 20,
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
                }}
              >
                {r.keyMoments.map((m) => (
                  <div key={m.label} className="card stat" style={{ background: 'var(--panel-2)' }}>
                    <div className="label">{m.label}</div>
                    <p className="note" style={{ marginTop: 6 }}>
                      {m.detail}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </>
  )
}
