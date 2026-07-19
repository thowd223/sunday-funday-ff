import { Link } from 'react-router-dom'
import { ManagerLink } from '../components/ManagerLink'
import { SEASONS, SEASON_YEARS } from '../data/league'
import { BADGES } from '../data/badges'
import { allCareerStats, luckRating } from '../lib/stats'
import { buildRecords } from '../lib/records'
import { num, pct, signedPct } from '../lib/format'

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

interface RecordCard {
  emoji: string
  label: string
  value: string
  meta: string
}

export function Awards() {
  const supers = superlatives()
  const byLuck = allCareerStats()
    .slice()
    .sort((a, b) => b.avgLuck - a.avgLuck)
  const luckiest = byLuck.slice(0, 5)
  const unluckiest = byLuck.slice(-5).reverse()
  const r = buildRecords()

  const phaseLabel = (phase: 'regular' | 'playoff') => (phase === 'playoff' ? 'playoffs' : 'regular season')

  const seasonCards: RecordCard[] = [
    {
      emoji: '🔥',
      label: 'Highest Single-Season Points For',
      value: num(r.highestSeasonPF.value),
      meta: `${r.highestSeasonPF.season} season`,
    },
    {
      emoji: '🥶',
      label: 'Lowest Single-Season Points For',
      value: num(r.lowestSeasonPF.value),
      meta: `${r.lowestSeasonPF.season} season`,
    },
    {
      emoji: '💪',
      label: 'Best Single-Season Point Differential',
      value: `+${num(r.bestSeasonPointDiff.value)}`,
      meta: `${r.bestSeasonPointDiff.season} season`,
    },
    {
      emoji: '💀',
      label: 'Worst Single-Season Point Differential',
      value: num(r.worstSeasonPointDiff.value),
      meta: `${r.worstSeasonPointDiff.season} season`,
    },
    {
      emoji: '🍀',
      label: 'Luckiest Season',
      value: signedPct(r.luckiestSeason.value),
      meta: `${r.luckiestSeason.season} season · actual win % vs. Pythagorean-expected`,
    },
    {
      emoji: '☔',
      label: 'Unluckiest Season',
      value: signedPct(r.unluckiestSeason.value),
      meta: `${r.unluckiestSeason.season} season · actual win % vs. Pythagorean-expected`,
    },
  ]

  const seasonCardManager: Record<number, string> = {
    0: r.highestSeasonPF.manager,
    1: r.lowestSeasonPF.manager,
    2: r.bestSeasonPointDiff.manager,
    3: r.worstSeasonPointDiff.manager,
    4: r.luckiestSeason.manager,
    5: r.unluckiestSeason.manager,
  }

  return (
    <>
      <div className="eyebrow">Superlatives & Legends</div>
      <h1 className="page-title">League Awards</h1>
      <p className="page-sub">
        Career badges tell each manager's story; the season superlatives table hands out the
        yearly hardware — top scorer, best record, and the luckiest and unluckiest teams. Below
        that, the league records book: streaks, single-game extremes, and the rivalries that
        got personal.
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

      <section className="section">
        <h2 className="section-title">🍀 Career Luck Rating</h2>
        <p className="page-sub">
          Some managers win more than their points scored say they should — that's luck rating,
          averaged across every season played. Positive means the wins have run hot; negative
          means the schedule's been a grind. This is a <em>different</em> metric from the site's{' '}
          <Link to="/luck">Luck Index</Link>, which compares actual wins to an all-play record
          instead of a Pythagorean expectation — worth a look if you want the fuller picture.
        </p>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Luckiest</th>
                  <th className="num">Avg Luck</th>
                </tr>
              </thead>
              <tbody>
                {luckiest.map((c) => (
                  <tr key={c.manager}>
                    <td>
                      <ManagerLink manager={c.manager} />
                    </td>
                    <td className="num pos">{signedPct(c.avgLuck)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Unluckiest</th>
                  <th className="num">Avg Luck</th>
                </tr>
              </thead>
              <tbody>
                {unluckiest.map((c) => (
                  <tr key={c.manager}>
                    <td>
                      <ManagerLink manager={c.manager} />
                    </td>
                    <td className="num neg">{signedPct(c.avgLuck)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="eyebrow" style={{ marginTop: 40 }}>
        League Records Book
      </div>

      <section className="section" style={{ marginTop: 12 }}>
        <h2 className="section-title">📈 Season Records</h2>
        <div className="grid stat-grid">
          {seasonCards.map((c, i) => (
            <div className="card stat" key={c.label}>
              <div className="label">
                {c.emoji} {c.label}
              </div>
              <div className="value">{c.value}</div>
              <div className="meta">
                <ManagerLink manager={seasonCardManager[i]} /> · {c.meta}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">🎯 Single-Game Records</h2>
        <div className="grid stat-grid">
          <div className="card stat">
            <div className="label">🚀 Highest Single-Game Score</div>
            <div className="value">{num(r.highestSingleGame.points)}</div>
            <div className="meta">
              <ManagerLink manager={r.highestSingleGame.manager} /> vs.{' '}
              <ManagerLink manager={r.highestSingleGame.opponent} plain /> · {r.highestSingleGame.season}{' '}
              wk {r.highestSingleGame.week} ({phaseLabel(r.highestSingleGame.phase)})
            </div>
          </div>
          <div className="card stat">
            <div className="label">🧊 Lowest Single-Game Score</div>
            <div className="value">{num(r.lowestSingleGame.points)}</div>
            <div className="meta">
              <ManagerLink manager={r.lowestSingleGame.manager} /> vs.{' '}
              <ManagerLink manager={r.lowestSingleGame.opponent} plain /> · {r.lowestSingleGame.season}{' '}
              wk {r.lowestSingleGame.week} ({phaseLabel(r.lowestSingleGame.phase)})
            </div>
          </div>
          <div className="card stat">
            <div className="label">💥 Biggest Blowout</div>
            <div className="value">
              +{num(r.biggestBlowout.margin)} <span className="muted">margin</span>
            </div>
            <div className="meta">
              <ManagerLink manager={r.biggestBlowout.winner} /> {num(r.biggestBlowout.winnerScore)} –{' '}
              {num(r.biggestBlowout.loserScore)} <ManagerLink manager={r.biggestBlowout.loser} plain /> ·{' '}
              {r.biggestBlowout.season} wk {r.biggestBlowout.week} ({phaseLabel(r.biggestBlowout.phase)})
            </div>
          </div>
          <div className="card stat">
            <div className="label">😰 Closest Game</div>
            <div className="value">
              {num(r.closestGame.margin, 2)} <span className="muted">margin</span>
            </div>
            <div className="meta">
              <ManagerLink manager={r.closestGame.winner} /> {num(r.closestGame.winnerScore, 2)} –{' '}
              {num(r.closestGame.loserScore, 2)} <ManagerLink manager={r.closestGame.loser} plain /> ·{' '}
              {r.closestGame.season} wk {r.closestGame.week} ({phaseLabel(r.closestGame.phase)})
            </div>
          </div>
        </div>
        {r.tiedScoreGames > 0 && (
          <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
            "Closest game" excludes exact ties — {r.tiedScoreGames} all-time{' '}
            {r.tiedScoreGames === 1 ? 'game has' : 'games have'} finished with identical scores,
            decided by the league's tiebreak rule rather than a true nonzero margin.
          </p>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">🔗 Streaks</h2>
        <div className="grid stat-grid">
          <div className="card stat">
            <div className="label">🏆 Longest Win Streak</div>
            <div className="value">{r.longestWinStreak.length}</div>
            <div className="meta">
              <ManagerLink manager={r.longestWinStreak.manager} /> · {r.longestWinStreak.season}{' '}
              season, weeks {r.longestWinStreak.startWeek}–{r.longestWinStreak.endWeek}
            </div>
          </div>
          <div className="card stat">
            <div className="label">🪦 Longest Losing Streak</div>
            <div className="value">{r.longestLossStreak.length}</div>
            <div className="meta">
              <ManagerLink manager={r.longestLossStreak.manager} /> · {r.longestLossStreak.season}{' '}
              season, weeks {r.longestLossStreak.startWeek}–{r.longestLossStreak.endWeek}
            </div>
          </div>
          <div className="card stat">
            <div className="label">⚔️ Longest Active Head-to-Head Streak</div>
            <div className="value">{r.longestActiveH2HStreak.length}</div>
            <div className="meta">
              <ManagerLink manager={r.longestActiveH2HStreak.manager} /> vs.{' '}
              <ManagerLink manager={r.longestActiveH2HStreak.opponent} plain /> · unbroken through{' '}
              {r.longestActiveH2HStreak.lastSeason}
            </div>
          </div>
        </div>
        <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
          Streaks reset at season boundaries — a hot or cold run can carry from the regular season
          into a manager's own playoffs, but one season's finale never chains into the next
          season's opener.
        </p>
      </section>

      <section className="section">
        <div className="row-between">
          <h2 className="section-title">😈 Most Lopsided Rivalry</h2>
          <Link to="/rivalries" className="muted" style={{ fontSize: 13 }}>
            All rivalries →
          </Link>
        </div>
        <Link
          to={`/rivalries/${r.mostLopsidedRivalry.manager}/${r.mostLopsidedRivalry.opponent}`}
          className="card stat"
          style={{ maxWidth: 420, display: 'block', color: 'inherit', textDecoration: 'none' }}
        >
          <div className="label">All-Time Head-to-Head Domination</div>
          <div className="value">
            {r.mostLopsidedRivalry.wins}-{r.mostLopsidedRivalry.losses}
            {r.mostLopsidedRivalry.ties > 0 ? `-${r.mostLopsidedRivalry.ties}` : ''}
          </div>
          <div className="meta">
            <ManagerLink manager={r.mostLopsidedRivalry.manager} plain /> vs.{' '}
            <ManagerLink manager={r.mostLopsidedRivalry.opponent} plain /> ·{' '}
            {pct(r.mostLopsidedRivalry.winPct)} win rate · full rivalry →
          </div>
        </Link>
        <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
          Minimum 10 all-time meetings required to qualify — enough games for the gap to mean
          something rather than a small-sample fluke.
        </p>
      </section>
    </>
  )
}
