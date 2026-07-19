import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { StatCard } from '../components/StatCard'
import { ManagerLink } from '../components/ManagerLink'
import { ResultBadge } from '../components/ResultBadge'
import { LEAGUE_NAME, SEASON_YEARS, SEASONS, displayName } from '../data/league'
import { allCareerStats, leagueTotals, seasonPodiums } from '../lib/stats'
import { rankRivalries } from '../lib/rivalry'
import { careerLuck } from '../lib/luck'
import { firstPickLedger, firstPickEverWon } from '../lib/draftGrades'
import { leagueTradeTotals, traderProfilesRanked } from '../lib/trades'
import { RECAPS } from '../data/recaps'
import { int, num, record } from '../lib/format'

/** A card-as-link teaser into one of the deeper stat pages, with a live-computed hook. */
function TeaserCard({
  to,
  emoji,
  title,
  children,
}: {
  to: string
  emoji: string
  title: string
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      className="card"
      style={{ display: 'block', padding: 18, textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
        {emoji} {title}
      </div>
      <div style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.5 }}>{children}</div>
    </Link>
  )
}

export function Overview() {
  const totals = leagueTotals()
  const careers = allCareerStats()
  const mostTitles = [...careers].sort((a, b) => b.championships - a.championships)[0]
  const podiums = seasonPodiums()
  const latest = podiums[podiums.length - 1]

  const topScoringSeason = SEASONS.reduce((b, r) => (r.pf > b.pf ? r : b), SEASONS[0])

  const topRivalry = rankRivalries()[0]
  const luck = [...careerLuck()].sort((a, b) => b.luck - a.luck)
  const luckiest = luck[0]
  const unluckiest = luck[luck.length - 1]
  const ledger = firstPickLedger()
  const oneOhOneWon = firstPickEverWon(ledger)
  const tradeTotals = leagueTradeTotals()
  const topTrader = traderProfilesRanked()[0]
  const latestStory = RECAPS[RECAPS.length - 1]

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
          <Link to="/seasons" className="btn btn-gold">
            🏆 Season history
          </Link>
          <Link to="/hall-of-fame" className="btn">
            Hall of Fame
          </Link>
          <Link to="/rivalries" className="btn">
            Rivalries
          </Link>
          <Link to="/stories" className="btn">
            Season Stories
          </Link>
          <Link to="/head-to-head" className="btn">
            Head-to-Head grid
          </Link>
          <Link to="/draft-history" className="btn">
            Draft History
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
          <Link to="/seasons" className="muted">
            All seasons →
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

      <section className="section">
        <h2 className="section-title">Dig Deeper</h2>
        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))' }}
        >
          {topRivalry && (
            <TeaserCard to="/rivalries" emoji="🥊" title="Rivalries">
              The Main Event: <strong>{displayName(topRivalry.stats.a)}</strong> vs.{' '}
              <strong>{displayName(topRivalry.stats.b)}</strong>,{' '}
              {record(
                topRivalry.stats.allTime.wins,
                topRivalry.stats.allTime.losses,
                topRivalry.stats.allTime.ties,
              )}
              . See every grudge in the league.
            </TeaserCard>
          )}
          <TeaserCard to="/luck" emoji="🎰" title="Luck Index">
            <strong>{displayName(luckiest.manager)}</strong> has ridden the schedule hardest;{' '}
            <strong>{displayName(unluckiest.manager)}</strong> has been robbed by it. Who's
            luckiest all-time?
          </TeaserCard>
          <TeaserCard to="/draft-grades" emoji="🎯" title="Draft Report Card">
            The #1-overall pick has {oneOhOneWon ? 'won it all before' : 'never once won a title'}{' '}
            in {ledger.length} tries. Grade every draft since 2012.
          </TeaserCard>
          <TeaserCard to="/trades" emoji="🤝" title="Trade History">
            {int(tradeTotals.totalTrades)} completed trades since 2019
            {topTrader && topTrader.totalTrades > 0 ? (
              <>
                , led by <strong>{displayName(topTrader.manager)}</strong> (
                {int(topTrader.totalTrades)})
              </>
            ) : null}
            . See who actually picks up the phone.
          </TeaserCard>
          {latestStory && (
            <TeaserCard to="/stories" emoji="📖" title="Season Stories">
              {latestStory.season}: <strong>&ldquo;{latestStory.headline}&rdquo;</strong> — every
              season's story, told in full.
            </TeaserCard>
          )}
        </div>
      </section>
    </>
  )
}
