import { ManagerLink } from '../components/ManagerLink'
import { SEASONS, SEASON_YEARS } from '../data/league'
import { BADGES } from '../data/badges'
import { luckRating } from '../lib/stats'
import { num, signedPct } from '../lib/format'

interface Superlative {
  season: number
  champion?: string
  topScorer: { manager: string; pf: number }
  bestRecord: { manager: string; w: number; l: number }
  luckiest: { manager: string; luck: number }
  unluckiest: { manager: string; luck: number }
}

function superlatives(): Superlative[] {
  return SEASON_YEARS.map((season) => {
    const rows = SEASONS.filter((r) => r.season === season)
    const champion = rows.find((r) => r.result === 'Champion')?.manager
    const topScorer = rows.reduce((b, r) => (r.pf > b.pf ? r : b))
    const bestRecord = rows.reduce((b, r) =>
      r.w > b.w || (r.w === b.w && r.pf > b.pf) ? r : b,
    )
    const withLuck = rows.map((r) => ({ manager: r.manager, luck: luckRating(r) }))
    const luckiest = withLuck.reduce((b, r) => (r.luck > b.luck ? r : b))
    const unluckiest = withLuck.reduce((b, r) => (r.luck < b.luck ? r : b))
    return {
      season,
      champion,
      topScorer: { manager: topScorer.manager, pf: topScorer.pf },
      bestRecord: { manager: bestRecord.manager, w: bestRecord.w, l: bestRecord.l },
      luckiest,
      unluckiest,
    }
  }).reverse()
}

export function Awards() {
  const supers = superlatives()

  return (
    <>
      <div className="eyebrow">Superlatives & Legends</div>
      <h1 className="page-title">League Awards</h1>
      <p className="page-sub">
        Career badges tell each manager's story; the season superlatives table hands out the
        yearly hardware — top scorer, best record, and the luckiest and unluckiest teams.
      </p>

      <section className="section">
        <h2 className="section-title">🎖️ Manager Badges</h2>
        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))' }}
        >
          {BADGES.map((b) => (
            <div className="card stat" key={b.manager}>
              <div className="badge-tag" style={{ fontSize: 15 }}>
                {b.badge}
              </div>
              <div style={{ fontWeight: 600, marginTop: 4 }}>
                <ManagerLink manager={b.manager} />
              </div>
              <p className="note">{b.why}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">📅 Season Superlatives</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Season</th>
                <th>Champion</th>
                <th>Highest Scorer</th>
                <th>Best Record</th>
                <th>Luckiest</th>
                <th>Unluckiest</th>
              </tr>
            </thead>
            <tbody>
              {supers.map((s) => (
                <tr key={s.season}>
                  <td style={{ fontWeight: 700 }}>{s.season}</td>
                  <td>{s.champion && <ManagerLink manager={s.champion} />}</td>
                  <td>
                    <ManagerLink manager={s.topScorer.manager} />
                    <span className="muted"> · {num(s.topScorer.pf)}</span>
                  </td>
                  <td>
                    <ManagerLink manager={s.bestRecord.manager} />
                    <span className="muted">
                      {' '}
                      · {s.bestRecord.w}-{s.bestRecord.l}
                    </span>
                  </td>
                  <td>
                    <ManagerLink manager={s.luckiest.manager} />
                    <span className="pos"> · {signedPct(s.luckiest.luck)}</span>
                  </td>
                  <td>
                    <ManagerLink manager={s.unluckiest.manager} />
                    <span className="neg"> · {signedPct(s.unluckiest.luck)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
          Luck rating = actual win % − Pythagorean-expected win % (exponent 2.37). Positive =
          overperformed points scored; negative = underperformed.
        </p>
      </section>
    </>
  )
}
