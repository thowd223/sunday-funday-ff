import { Link } from 'react-router-dom'
import { StatCard } from '../components/StatCard'
import { ManagerLink } from '../components/ManagerLink'
import { ResultBadge } from '../components/ResultBadge'
import {
  LEAGUE_NAME,
  SEASON_YEARS,
  SEASONS,
  USER_USERNAME,
  displayName,
} from '../data/league'
import { allCareerStats, leagueTotals, seasonPodiums } from '../lib/stats'
import { int, num } from '../lib/format'

export function Overview() {
  const totals = leagueTotals()
  const careers = allCareerStats()
  const mostTitles = [...careers].sort((a, b) => b.championships - a.championships)[0]
  const podiums = seasonPodiums()
  const latest = podiums[podiums.length - 1]
  const user = careers.find((c) => c.manager === USER_USERNAME)!

  const topScoringSeason = SEASONS.reduce((b, r) => (r.pf > b.pf ? r : b), SEASONS[0])

  return (
    <>
      <section className="card hero">
        <div className="eyebrow">Est. 2012 · 12 managers · 14 completed seasons</div>
        <h1>{LEAGUE_NAME}</h1>
        <p className="lede">
          A living record of every season, champion, and career in the league — from the
          ESPN era through today on Sleeper. Fourteen years of trophies, heartbreak, and
          bragging rights, all in one place.
        </p>
        <div className="cta">
          <Link to="/champions" className="btn btn-gold">
            🏆 See the champions
          </Link>
          <Link to="/hall-of-fame" className="btn">
            Hall of Fame
          </Link>
          <Link to="/head-to-head" className="btn">
            Head-to-Head grid
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="grid stat-grid">
          <StatCard label="Seasons Played" value={totals.seasonsPlayed} meta="2012 – 2025" />
          <StatCard
            label="Most Championships"
            value={mostTitles.championships}
            meta={displayName(mostTitles.manager)}
          />
          <StatCard
            label="Games Played"
            value={int(Math.round(totals.totalGames))}
            meta={`${int(Math.round(totals.totalPoints))} total points scored`}
          />
          <StatCard
            label="Single-Season Record"
            value={num(topScoringSeason.pf)}
            meta={`${displayName(topScoringSeason.manager)}, ${topScoringSeason.season}`}
          />
        </div>
      </section>

      <section className="section">
        <div className="row-between">
          <h2 className="section-title">🏆 Reigning Champion · {latest.season}</h2>
          <Link to="/champions" className="muted">
            All champions →
          </Link>
        </div>
        <div className="card stat">
          <div className="row-between">
            <div>
              <div className="value" style={{ fontSize: 26 }}>
                <ManagerLink manager={latest.champion!} />
              </div>
              <div className="meta">
                {SEASONS.find(
                  (r) => r.season === latest.season && r.manager === latest.champion,
                )?.team ?? ''}
              </div>
            </div>
            <ResultBadge result="Champion" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="row-between">
          <h2 className="section-title">Your Career · {displayName(USER_USERNAME)}</h2>
          <Link to={`/managers/${USER_USERNAME}`} className="muted">
            Full career →
          </Link>
        </div>
        <div className="grid stat-grid">
          <StatCard label="Championships" value={user.championships} meta="2017 · 2019 · 2025" />
          <StatCard
            label="Career Record"
            value={`${user.wins}-${user.losses}`}
            meta={`${num(user.winPct * 100)}% win rate`}
          />
          <StatCard label="Playoff Appearances" value={user.playoffAppearances} />
          <StatCard label="Seasons" value={user.seasons} meta={`since ${user.firstSeason}`} />
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Recent Seasons</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Season</th>
                <th>Champion</th>
                <th>Runner-Up</th>
                <th>3rd</th>
              </tr>
            </thead>
            <tbody>
              {[...podiums]
                .reverse()
                .slice(0, 6)
                .map((p) => (
                  <tr key={p.season}>
                    <td style={{ fontWeight: 700 }}>{p.season}</td>
                    <td>{p.champion && <ManagerLink manager={p.champion} />}</td>
                    <td>{p.runnerUp && <ManagerLink manager={p.runnerUp} />}</td>
                    <td>{p.third && <ManagerLink manager={p.third} />}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
          Data covers {SEASON_YEARS[0]}–{SEASON_YEARS[SEASON_YEARS.length - 1]}. 2026 is
          pre-draft and excluded from all stats.
        </p>
      </section>
    </>
  )
}
