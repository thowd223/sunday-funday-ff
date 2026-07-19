import type { BracketGame } from '../data/league'
import { SEASONS, playoffBracketFor } from '../data/league'
import { ManagerLink } from './ManagerLink'
import { num } from '../lib/format'

interface BracketSide {
  manager: string
  result: 'W' | 'L' | 'T'
  pf: number | null
}

interface BracketMatchup {
  key: string
  place: number | null
  teamA: BracketSide
  teamB: BracketSide
}

interface BracketRound {
  label: string
  matchups: BracketMatchup[]
}

function ordinal(n: number): string {
  const rem100 = n % 100
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`
  switch (n % 10) {
    case 1:
      return `${n}st`
    case 2:
      return `${n}nd`
    case 3:
      return `${n}rd`
    default:
      return `${n}th`
  }
}

function roundLabel(idx: number, totalRounds: number): string {
  const distanceFromFinal = totalRounds - 1 - idx
  if (distanceFromFinal === 0) return 'Championship'
  if (distanceFromFinal === 1) return 'Semifinal'
  if (distanceFromFinal === 2) return 'Quarterfinal'
  return `Round ${idx + 1}`
}

/**
 * Builds the real championship bracket for a season, reconciling two incompatible
 * data shapes: ESPN-era games (2012-2018) are tagged with a `tier` string and
 * ordered by `week` (no `round`); Sleeper-era games (2019+) carry a numeric `round`
 * and a `place` on the game that decides a given finish, but no `tier` at all.
 * Toilet-bowl games (flagged `consolation`) are excluded in both eras — only the
 * real championship bracket among playoff qualifiers is shown.
 */
function buildSeasonBracket(season: number): BracketRound[] | null {
  const managers = [...new Set(SEASONS.filter((r) => r.season === season).map((r) => r.manager))]
  if (managers.length === 0) return null

  const gamesByManager = new Map<string, BracketGame[]>()
  for (const m of managers) {
    gamesByManager.set(m, playoffBracketFor(season, m))
  }

  const isTiered = [...gamesByManager.values()].some((games) => games.some((g) => g.tier))

  const realGames = new Map<string, BracketGame[]>()
  for (const [m, games] of gamesByManager) {
    const real = isTiered
      ? games.filter((g) => g.tier === 'WINNERS_BRACKET')
      : games.filter((g) => g.round != null && !g.consolation)
    if (real.length > 0) realGames.set(m, real)
  }
  if (realGames.size === 0) return null

  const roundKeys = new Set<number>()
  for (const games of realGames.values()) {
    for (const g of games) roundKeys.add(isTiered ? g.week : (g.round as number))
  }
  const sortedKeys = [...roundKeys].sort((a, b) => a - b)
  if (sortedKeys.length === 0) return null

  const matchupsByRound: BracketMatchup[][] = sortedKeys.map(() => [])
  const seenPairs = new Set<string>()

  for (const [manager, games] of realGames) {
    for (const g of games) {
      const key = isTiered ? g.week : (g.round as number)
      const roundIdx = sortedKeys.indexOf(key)
      const pairId = `${key}:${[manager, g.opponent].sort().join('|')}`
      if (seenPairs.has(pairId)) continue
      seenPairs.add(pairId)

      const oppGames = realGames.get(g.opponent) ?? gamesByManager.get(g.opponent) ?? []
      const oppGame = oppGames.find(
        (og) => og.opponent === manager && (isTiered ? og.week === g.week : og.round === g.round),
      )

      matchupsByRound[roundIdx].push({
        key: pairId,
        place: g.place ?? oppGame?.place ?? null,
        teamA: { manager, result: g.result, pf: g.pf },
        teamB: {
          manager: g.opponent,
          result: oppGame?.result ?? (g.result === 'W' ? 'L' : g.result === 'L' ? 'W' : 'T'),
          pf: oppGame?.pf ?? g.pa,
        },
      })
    }
  }

  return sortedKeys.map((_, idx) => ({
    label: roundLabel(idx, sortedKeys.length),
    matchups: matchupsByRound[idx],
  }))
}

const resultColor: Record<'W' | 'L' | 'T', string> = {
  W: 'var(--pos)',
  L: 'var(--text-faint)',
  T: 'var(--text-dim)',
}

function BracketTeamRow({ side }: { side: BracketSide }) {
  const won = side.result === 'W'
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '4px 2px',
        fontWeight: won ? 700 : 500,
        color: won ? 'var(--text)' : 'var(--text-faint)',
      }}
    >
      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}
      >
        <ManagerLink manager={side.manager} />
      </span>
      <span style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexShrink: 0 }}>
        {side.pf != null && (
          <span
            style={{
              fontSize: 11,
              fontWeight: won ? 700 : 500,
              color: won ? 'var(--text-dim)' : 'var(--text-faint)',
            }}
          >
            {num(side.pf)}
          </span>
        )}
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: resultColor[side.result],
          }}
        >
          {side.result}
        </span>
      </span>
    </div>
  )
}

/** Visual playoff bracket (columns of rounds, boxes of matchups) for a single season. */
export function PlayoffBracket({ season }: { season: number }) {
  const rounds = buildSeasonBracket(season)

  if (!rounds || rounds.length === 0) {
    return <p className="muted">No playoff bracket data available for {season}.</p>
  }

  return (
    <div className="bracket-scroll">
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
        {rounds.map((round, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              minWidth: 200,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                textAlign: 'center',
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--gold)',
              }}
            >
              {round.label}
            </div>
            {round.matchups.map((m) => (
              <div
                key={m.key}
                style={{
                  position: 'relative',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--panel)',
                  padding: '10px 12px',
                }}
              >
                {m.place != null && m.place !== 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -9,
                      left: 10,
                      background: 'var(--ink-3)',
                      border: '1px solid var(--line)',
                      color: 'var(--text-dim)',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      padding: '1px 6px',
                      borderRadius: 999,
                    }}
                  >
                    {ordinal(m.place)} Place
                  </div>
                )}
                <BracketTeamRow side={m.teamA} />
                <div style={{ borderTop: '1px solid rgba(42, 55, 80, 0.5)' }} />
                <BracketTeamRow side={m.teamB} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
