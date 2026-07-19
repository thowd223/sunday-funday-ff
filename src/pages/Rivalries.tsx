import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { displayName } from '../data/league'
import { rankRivalries, type RankedRivalry } from '../lib/rivalry'
import { record } from '../lib/format'

/** "kdavis leads 9-5-1" / "Series tied 6-6" — from the a-side's perspective. */
function leaderPhrase(r: RankedRivalry): string {
  const { a, b, allTime } = r.stats
  const rec = record(allTime.wins, allTime.losses, allTime.ties)
  if (allTime.wins === allTime.losses) return `Series tied ${rec}`
  const leader = allTime.wins > allTime.losses ? a : b
  const leaderRecord =
    allTime.wins > allTime.losses
      ? rec
      : record(allTime.losses, allTime.wins, allTime.ties)
  return `${displayName(leader)} leads ${leaderRecord}`
}

function meetingsCount(r: RankedRivalry): number {
  return r.stats.allTime.wins + r.stats.allTime.losses + r.stats.allTime.ties
}

function eliminationsCount(r: RankedRivalry): number {
  return r.stats.eliminations.length
}

export function Rivalries() {
  const ranked = useMemo(() => rankRivalries(), [])
  const featured = ranked[0]
  const rest = ranked.slice(1, 15)

  return (
    <>
      <div className="eyebrow">Grudges</div>
      <h1 className="page-title">Rivalries</h1>
      <p className="page-sub">
        Every pair of managers who've played at least six times, ranked by a "heat" score that
        rewards a long history, a close all-time record, meetings that came with a playoff spot
        on the line, and outright eliminations — recent series are ranked above dormant ones.
      </p>

      {featured && (
        <section className="section">
          <FeaturedCard rank={1} r={featured} />
        </section>
      )}

      {rest.length > 0 && (
        <section className="section">
          <h2 className="section-title">The Rest of the League</h2>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {rest.map((r, i) => (
              <RivalryCard key={`${r.stats.a}-${r.stats.b}`} rank={i + 2} r={r} />
            ))}
          </div>
        </section>
      )}

      {ranked.length === 0 && (
        <p className="muted" style={{ marginTop: 24 }}>
          No rivalries with enough history yet.
        </p>
      )}
    </>
  )
}

function FeaturedCard({ rank, r }: { rank: number; r: RankedRivalry }) {
  const { a, b } = r.stats
  const elims = eliminationsCount(r)
  return (
    <Link
      to={`/rivalries/${a}/${b}`}
      className="card"
      style={{
        display: 'block',
        padding: 'clamp(20px, 4vw, 32px)',
        border: '1px solid rgba(201, 162, 39, 0.5)',
        boxShadow: '0 0 0 1px rgba(201, 162, 39, 0.12) inset',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div className="row-between" style={{ marginBottom: 12 }}>
        <span className="chip" style={{ color: 'var(--gold-soft)', borderColor: 'rgba(201, 162, 39, 0.5)' }}>
          #{rank} · The Main Event
        </span>
        <span className="muted" style={{ fontSize: 13 }}>
          Heat {r.heat.toFixed(0)}
        </span>
      </div>
      <div style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 800 }}>
        {displayName(a)} <span className="muted">vs.</span> {displayName(b)}
      </div>
      <div style={{ marginTop: 10, fontSize: 16, color: 'var(--text-dim)' }}>
        {leaderPhrase(r)} · {meetingsCount(r)} all-time meetings
      </div>
      <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {r.stats.playoff.wins + r.stats.playoff.losses + r.stats.playoff.ties > 0 && (
          <span className="chip">
            {r.stats.playoff.wins + r.stats.playoff.losses + r.stats.playoff.ties} playoff meetings
          </span>
        )}
        {elims > 0 && (
          <span
            className="chip"
            style={{ color: 'var(--gold-soft)', borderColor: 'rgba(201, 162, 39, 0.5)' }}
          >
            {elims} playoff elimination{elims === 1 ? '' : 's'}
          </span>
        )}
      </div>
    </Link>
  )
}

function RivalryCard({ rank, r }: { rank: number; r: RankedRivalry }) {
  const { a, b } = r.stats
  const elims = eliminationsCount(r)
  return (
    <Link
      to={`/rivalries/${a}/${b}`}
      className="card"
      style={{ display: 'block', padding: 18, textDecoration: 'none', color: 'inherit' }}
    >
      <div className="row-between" style={{ marginBottom: 8 }}>
        <span className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
          #{rank}
        </span>
        <span className="muted" style={{ fontSize: 12 }}>
          Heat {r.heat.toFixed(0)}
        </span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>
        {displayName(a)} <span className="muted">vs.</span> {displayName(b)}
      </div>
      <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-dim)' }}>
        {leaderPhrase(r)} · {meetingsCount(r)} meetings
      </div>
      {elims > 0 && (
        <div style={{ marginTop: 10 }}>
          <span
            className="chip"
            style={{ color: 'var(--gold-soft)', borderColor: 'rgba(201, 162, 39, 0.5)' }}
          >
            {elims} playoff elimination{elims === 1 ? '' : 's'}
          </span>
        </div>
      )}
    </Link>
  )
}
