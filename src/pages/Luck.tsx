import { useMemo } from 'react'
import { ManagerLink } from '../components/ManagerLink'
import {
  careerLuck,
  luckBySeason,
  unluckiestLosses,
  biggestSteals,
  playoffSnubs,
} from '../lib/luck'
import { num, pct, record } from '../lib/format'

const SEASON_EXTREMES_COUNT = 8
const GAME_EXTREMES_COUNT = 10

export function Luck() {
  const career = useMemo(() => careerLuck(), [])
  const seasons = useMemo(() => luckBySeason(), [])
  const heartbreaks = useMemo(() => unluckiestLosses(GAME_EXTREMES_COUNT), [])
  const steals = useMemo(() => biggestSteals(GAME_EXTREMES_COUNT), [])
  const snubs = useMemo(() => playoffSnubs(), [])

  const seasonsByLuck = useMemo(
    () => [...seasons].sort((a, b) => b.luck - a.luck),
    [seasons],
  )
  const luckiestSeasons = seasonsByLuck.slice(0, SEASON_EXTREMES_COUNT)
  const unluckiestSeasons = seasonsByLuck.slice(-SEASON_EXTREMES_COUNT).reverse()

  return (
    <>
      <div className="eyebrow">Analytics</div>
      <h1 className="page-title">Luck Index</h1>
      <p className="page-sub">
        Your "all-play" record is the record you'd have if you played every other manager
        every single week, instead of just the one opponent the schedule gave you — it's the
        purest read on how good a team actually was, with the schedule stripped out. Luck Index
        is simply <strong>actual wins minus deserved wins</strong> (all-play win % × games
        played): positive means you won more than your scoring earned, negative means the
        schedule owed you and never paid up.
      </p>

      <section className="section">
        <h2 className="section-title">🎰 Career Luck Leaderboard</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
          Every manager's full career, regular season only. <span className="pos">Green</span>{' '}
          means their actual win total ran hotter than their weekly scoring deserved;{' '}
          <span className="neg">red</span> means it ran colder. Sorted luckiest to unluckiest.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Manager</th>
                <th className="num">Actual W-L</th>
                <th className="num">All-Play W-L</th>
                <th className="num">All-Play Win %</th>
                <th className="num">Expected W</th>
                <th className="num">Luck Index</th>
              </tr>
            </thead>
            <tbody>
              {career.map((c, i) => {
                const isExtreme = i === 0 || i === career.length - 1
                return (
                  <tr key={c.manager} style={isExtreme ? { fontWeight: 600 } : undefined}>
                    <td className="muted">{i + 1}</td>
                    <td>
                      <ManagerLink manager={c.manager} />
                    </td>
                    <td className="num">{record(c.actualW, c.actualL)}</td>
                    <td className="num">{record(c.allPlay.w, c.allPlay.l, c.allPlay.t)}</td>
                    <td className="num">{pct(c.allPlayWinPct)}</td>
                    <td className="num">{num(c.expectedWins)}</td>
                    <td className={`num ${c.luck >= 0 ? 'pos' : 'neg'}`}>
                      {c.luck >= 0 ? '+' : ''}
                      {num(c.luck, 2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
          Expected wins = all-play win % × games played that career. Luck Index = actual wins −
          expected wins, summed season by season (so a career spanning both the 8-week 2012
          slate and the 13-week modern season weighs each year on its own terms).
        </p>
      </section>

      <section className="section">
        <h2 className="section-title">📆 Luckiest &amp; Unluckiest Seasons</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
          Single manager-seasons, not careers — the years the schedule was kindest or cruelest.
        </p>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(420px, 100%),1fr))' }}>
          <div>
            <h3 style={{ fontSize: 15, color: 'var(--gold-soft)', marginBottom: 8 }}>
              🍀 Luckiest
            </h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Manager</th>
                    <th>Season</th>
                    <th className="num">Actual</th>
                    <th className="num">All-Play</th>
                    <th className="num">Luck</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {luckiestSeasons.map((s) => (
                    <tr key={`${s.manager}-${s.season}`}>
                      <td>
                        <ManagerLink manager={s.manager} />
                      </td>
                      <td className="muted">{s.season}</td>
                      <td className="num">{record(s.actualW, s.actualL)}</td>
                      <td className="num">{record(s.allPlay.w, s.allPlay.l, s.allPlay.t)}</td>
                      <td className="num pos">
                        +{num(s.luck, 2)}
                      </td>
                      <td className="muted">{s.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: 15, color: 'var(--gold-soft)', marginBottom: 8 }}>
              ☔ Unluckiest
            </h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Manager</th>
                    <th>Season</th>
                    <th className="num">Actual</th>
                    <th className="num">All-Play</th>
                    <th className="num">Luck</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {unluckiestSeasons.map((s) => (
                    <tr key={`${s.manager}-${s.season}`}>
                      <td>
                        <ManagerLink manager={s.manager} />
                      </td>
                      <td className="muted">{s.season}</td>
                      <td className="num">{record(s.actualW, s.actualL)}</td>
                      <td className="num">{record(s.allPlay.w, s.allPlay.l, s.allPlay.t)}</td>
                      <td className="num neg">{num(s.luck, 2)}</td>
                      <td className="muted">{s.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">💔 Heartbreak Games</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
          The unluckiest losses in league history — regular-season games lost despite scoring
          more than almost anyone else who's ever lost a matchup.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Season</th>
                <th>Week</th>
                <th>Manager</th>
                <th className="num">Score</th>
                <th>Beaten by</th>
                <th className="num">Winning Score</th>
              </tr>
            </thead>
            <tbody>
              {heartbreaks.map((g, i) => (
                <tr key={`${g.season}-${g.week}-${g.manager}`}>
                  <td className="muted">{i + 1}</td>
                  <td className="muted">{g.season}</td>
                  <td className="muted">{g.week}</td>
                  <td>
                    <ManagerLink manager={g.manager} />
                  </td>
                  <td className="num neg">{num(g.pf)}</td>
                  <td>
                    <ManagerLink manager={g.opponent} />
                  </td>
                  <td className="num">{num(g.pa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">🏴‍☠️ Daylight Robbery</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
          The biggest steals in league history — regular-season wins that scraped by with some
          of the lowest winning scores ever posted.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Season</th>
                <th>Week</th>
                <th>Manager</th>
                <th className="num">Winning Score</th>
                <th>Victim</th>
                <th className="num">Losing Score</th>
              </tr>
            </thead>
            <tbody>
              {steals.map((g, i) => (
                <tr key={`${g.season}-${g.week}-${g.manager}`}>
                  <td className="muted">{i + 1}</td>
                  <td className="muted">{g.season}</td>
                  <td className="muted">{g.week}</td>
                  <td>
                    <ManagerLink manager={g.manager} />
                  </td>
                  <td className="num pos">{num(g.pf)}</td>
                  <td>
                    <ManagerLink manager={g.opponent} />
                  </td>
                  <td className="num">{num(g.pa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {snubs.length > 0 && (
        <section className="section">
          <h2 className="section-title">🚪 Snubbed</h2>
          <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
            Manager-seasons that scored like a playoff team — ranking inside that year's playoff
            field by all-play win % — but missed the postseason anyway on the real standings.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Manager</th>
                  <th>Season</th>
                  <th className="num">All-Play Win %</th>
                  <th className="num">All-Play Rank</th>
                  <th className="num">Playoff Field</th>
                  <th className="num">Actual Rank</th>
                </tr>
              </thead>
              <tbody>
                {snubs.map((s) => (
                  <tr key={`${s.manager}-${s.season}`}>
                    <td>
                      <ManagerLink manager={s.manager} />
                    </td>
                    <td className="muted">{s.season}</td>
                    <td className="num pos">{pct(s.allPlayWinPct)}</td>
                    <td className="num">{s.allPlayRank}</td>
                    <td className="num">{s.fieldSize}</td>
                    <td className="num neg">{s.regSeasonRank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  )
}
