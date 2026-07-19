import { Link, useParams } from 'react-router-dom'
import { ManagerLink } from '../components/ManagerLink'
import { PlayoffBracket } from '../components/PlayoffBracket'
import { ResultBadge } from '../components/ResultBadge'
import {
  SEASONS,
  SEASON_YEARS,
  playoffRecordFor,
  tradesForSeason,
  type PlayoffResult,
} from '../data/league'
import { luckRating } from '../lib/stats'
import { num, signedPct } from '../lib/format'
import { recapForSeason } from '../data/recaps'

const FINISH_ORDER: PlayoffResult[] = [
  'Champion',
  'Runner-Up',
  '3rd Place',
  '4th Place',
  'Made Playoffs',
]

export function SeasonDetail() {
  const { year: yearParam = '' } = useParams()
  const year = Number(yearParam)

  if (!SEASON_YEARS.includes(year)) {
    return (
      <>
        <h1 className="page-title">Unknown season</h1>
        <p className="page-sub">
          No records for “{yearParam}”. <Link to="/seasons">Back to all seasons →</Link>
        </p>
      </>
    )
  }

  const rows = SEASONS.filter((r) => r.season === year)
  const prevYear = year - 1
  const nextYear = year + 1
  const hasPrev = SEASON_YEARS.includes(prevYear)
  const hasNext = SEASON_YEARS.includes(nextYear)

  const playoffRows = rows
    .filter((r) => r.result !== 'Missed Playoffs')
    .sort((a, b) => FINISH_ORDER.indexOf(a.result) - FINISH_ORDER.indexOf(b.result))

  const trades = tradesForSeason(year)
  const recap = recapForSeason(year)

  return (
    <>
      <Link to="/seasons" className="muted" style={{ fontSize: 13 }}>
        ← All seasons
      </Link>

      <div className="row-between" style={{ marginTop: 16 }}>
        <h1 className="page-title">{year} Season</h1>
        <div style={{ display: 'flex', gap: 16 }}>
          {hasPrev && <Link to={`/seasons/${prevYear}`}>← {prevYear}</Link>}
          {hasNext && <Link to={`/seasons/${nextYear}`}>{nextYear} →</Link>}
        </div>
      </div>

      {recap && (
        <section className="section">
          <h2 className="section-title">The Story</h2>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800 }}>{recap.headline}</h3>
            {recap.subhead && (
              <p className="muted" style={{ marginTop: 6, fontSize: 14.5, lineHeight: 1.5 }}>
                {recap.subhead}
              </p>
            )}
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recap.paragraphs.map((p, i) => (
                <p key={i} style={{ lineHeight: 1.65, fontSize: 14.5 }}>
                  {p}
                </p>
              ))}
            </div>
            {recap.keyMoments && recap.keyMoments.length > 0 && (
              <div
                className="grid"
                style={{
                  marginTop: 16,
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
                }}
              >
                {recap.keyMoments.map((m) => (
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
      )}

      <section className="section">
        <h2 className="section-title">Regular Season</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Manager</th>
                <th>Team</th>
                <th className="num">W-L</th>
                <th className="num">PF</th>
                <th className="num">PA</th>
                <th className="num">Diff</th>
                <th className="num">Luck</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const luck = luckRating(r)
                const diff = r.pf - r.pa
                return (
                  <tr key={r.manager}>
                    <td style={{ fontWeight: 700 }}>{r.reg_season_rank}</td>
                    <td>
                      <ManagerLink manager={r.manager} />
                    </td>
                    <td className="muted">{r.team}</td>
                    <td className="num">
                      {r.w}-{r.l}
                    </td>
                    <td className="num">{num(r.pf)}</td>
                    <td className="num">{num(r.pa)}</td>
                    <td className={`num ${diff >= 0 ? 'pos' : 'neg'}`}>
                      {diff >= 0 ? '+' : ''}
                      {num(diff)}
                    </td>
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

      <section className="section">
        <h2 className="section-title">Playoffs</h2>
        <div className="card" style={{ padding: 20 }}>
          <PlayoffBracket season={year} />
        </div>

        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table>
            <thead>
              <tr>
                <th>Finish</th>
                <th>Manager</th>
                <th className="num">Playoff W-L</th>
              </tr>
            </thead>
            <tbody>
              {playoffRows.map((r) => {
                const po = playoffRecordFor(year, r.manager)
                return (
                  <tr key={r.manager}>
                    <td>
                      <ResultBadge result={r.result} />
                    </td>
                    <td>
                      <ManagerLink manager={r.manager} />
                    </td>
                    <td className="num">
                      {po.wins}-{po.losses}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Trades</h2>
        {trades.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {trades.map((trade, idx) => (
              <div key={idx} className="card" style={{ padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Week {trade.week}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {trade.parties.map((party, pIdx) => (
                    <div key={pIdx}>
                      <ManagerLink manager={party.manager} /> received:{' '}
                      {party.received.join(', ')}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : year >= 2019 ? (
          <p className="muted">No trades this season.</p>
        ) : (
          <p className="muted">
            Trade records aren&apos;t available for the ESPN era (2012–2018).
          </p>
        )}
      </section>

      <p className="page-sub">
        <Link to={`/draft-history/${year}`}>View the {year} draft →</Link>
      </p>
    </>
  )
}
