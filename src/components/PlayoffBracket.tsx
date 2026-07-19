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
  /** null = a first-round bye: teamA advances with no opponent that round. */
  teamB: BracketSide | null
}

interface BracketRound {
  label: string
  matchups: BracketMatchup[]
}

interface SeasonBracket {
  /** The championship path only — one column per round, byes included. */
  rounds: BracketRound[]
  /** 3rd-place, 5th-place, etc. — games that don't feed into the next round. */
  placementGames: BracketMatchup[]
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

/** A game with a place decided (other than 1st) doesn't advance anywhere — it's a placement game. */
function isPlacementGame(place: number | null): boolean {
  return place != null && place !== 1
}

/**
 * Builds the real championship bracket for a season, reconciling two incompatible
 * data shapes: ESPN-era games (2012-2018) are tagged with a `tier` string and
 * ordered by `week` (no `round`); Sleeper-era games (2019+) carry a numeric `round`
 * and a `place` on the game that decides a given finish, but no `tier` at all.
 * Toilet-bowl games (flagged `consolation`) are excluded in both eras — only the
 * real championship bracket among playoff qualifiers is shown.
 *
 * Two things the raw per-manager game list doesn't spell out, that this
 * reconstructs explicitly: top seeds who skip the first round (byes) never
 * have a game row for that round at all, and 3rd/5th-place games are just
 * more games with a `place` set — nothing marks them as *not* part of the
 * main championship path. Both matter for a bracket that reads clearly.
 */
function buildSeasonBracket(season: number): SeasonBracket | null {
  const managers = [...new Set(SEASONS.filter((r) => r.season === season).map((r) => r.manager))]
  if (managers.length === 0) return null

  const gamesByManager = new Map<string, BracketGame[]>()
  for (const m of managers) {
    gamesByManager.set(m, playoffBracketFor(season, m))
  }

  const isTiered = [...gamesByManager.values()].some((games) => games.some((g) => g.tier))
  const keyOf = (g: BracketGame) => (isTiered ? g.week : (g.round as number))

  const realGames = new Map<string, BracketGame[]>()
  for (const [m, games] of gamesByManager) {
    const real = isTiered
      ? games.filter((g) => g.tier === 'WINNERS_BRACKET')
      : games.filter((g) => g.round != null && !g.consolation)
    if (real.length > 0) realGames.set(m, real)
  }
  if (realGames.size === 0) return null

  // Round columns are defined by the championship path only (place null, or
  // place === 1 for the final) — a round that's only ever a placement game
  // still gets no column of its own; that game lives in the placement row.
  const roundKeys = new Set<number>()
  for (const games of realGames.values()) {
    for (const g of games) if (!isPlacementGame(g.place)) roundKeys.add(keyOf(g))
  }
  const sortedKeys = [...roundKeys].sort((a, b) => a - b)
  if (sortedKeys.length === 0) return null

  const matchupsByRound: BracketMatchup[][] = sortedKeys.map(() => [])
  const placementGames: BracketMatchup[] = []
  const seenPairs = new Set<string>()

  for (const [manager, games] of realGames) {
    for (const g of games) {
      const key = keyOf(g)
      const pairId = `${key}:${[manager, g.opponent].sort().join('|')}`
      if (seenPairs.has(pairId)) continue
      seenPairs.add(pairId)

      const oppGames = realGames.get(g.opponent) ?? gamesByManager.get(g.opponent) ?? []
      const oppGame = oppGames.find((og) => og.opponent === manager && keyOf(og) === key)

      const matchup: BracketMatchup = {
        key: pairId,
        place: g.place ?? oppGame?.place ?? null,
        teamA: { manager, result: g.result, pf: g.pf },
        teamB: {
          manager: g.opponent,
          result: oppGame?.result ?? (g.result === 'W' ? 'L' : g.result === 'L' ? 'W' : 'T'),
          pf: oppGame?.pf ?? g.pa,
        },
      }

      if (isPlacementGame(matchup.place)) {
        placementGames.push(matchup)
      } else {
        const roundIdx = sortedKeys.indexOf(key)
        if (roundIdx >= 0) matchupsByRound[roundIdx].push(matchup)
      }
    }
  }

  // First-round byes: a manager with a championship-path game, but not until
  // a later round than the bracket's earliest — give them an explicit "bye"
  // box in every round they skipped, so the bracket accounts for all teams.
  for (const [manager, games] of realGames) {
    const mainRoundIdxs = games
      .filter((g) => !isPlacementGame(g.place))
      .map((g) => sortedKeys.indexOf(keyOf(g)))
      .filter((i) => i >= 0)
    if (mainRoundIdxs.length === 0) continue
    const firstRoundIdx = Math.min(...mainRoundIdxs)
    for (let r = 0; r < firstRoundIdx; r++) {
      matchupsByRound[r].push({
        key: `bye:${manager}:${r}`,
        place: null,
        teamA: { manager, result: 'W', pf: null },
        teamB: null,
      })
    }
  }

  const rounds = sortedKeys.map((_, idx) => ({
    label: roundLabel(idx, sortedKeys.length),
    matchups: matchupsByRound[idx],
  }))

  placementGames.sort((a, b) => (a.place ?? 0) - (b.place ?? 0))

  return { rounds, placementGames }
}

const resultColor: Record<'W' | 'L' | 'T', string> = {
  W: 'var(--pos)',
  L: 'var(--text-faint)',
  T: 'var(--text-dim)',
}

const matchupBoxStyle = {
  position: 'relative' as const,
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--panel)',
  padding: '10px 12px',
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
        <span style={{ fontSize: 12, fontWeight: 800, color: resultColor[side.result] }}>
          {side.result}
        </span>
      </span>
    </div>
  )
}

/** One matchup box — a normal head-to-head game, or (teamB === null) a first-round bye. */
function MatchupBox({ m }: { m: BracketMatchup }) {
  if (m.teamB === null) {
    return (
      <div style={{ ...matchupBoxStyle, borderStyle: 'dashed', opacity: 0.85 }}>
        <BracketTeamRow side={m.teamA} />
        <div style={{ borderTop: '1px solid rgba(42, 55, 80, 0.5)' }} />
        <div
          style={{
            padding: '4px 2px',
            fontSize: 11,
            fontStyle: 'italic',
            fontWeight: 600,
            color: 'var(--text-faint)',
          }}
        >
          BYE — advances automatically
        </div>
      </div>
    )
  }
  return (
    <div style={matchupBoxStyle}>
      <BracketTeamRow side={m.teamA} />
      <div style={{ borderTop: '1px solid rgba(42, 55, 80, 0.5)' }} />
      <BracketTeamRow side={m.teamB} />
    </div>
  )
}

/** Visual playoff bracket (columns of rounds, boxes of matchups) for a single season. */
export function PlayoffBracket({ season }: { season: number }) {
  const bracket = buildSeasonBracket(season)

  if (!bracket || bracket.rounds.length === 0) {
    return <p className="muted">No playoff bracket data available for {season}.</p>
  }

  const { rounds, placementGames } = bracket

  return (
    <>
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
                <MatchupBox key={m.key} m={m} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {placementGames.length > 0 && (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-faint)',
              marginBottom: 12,
            }}
          >
            Placement Games
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {placementGames.map((m) => (
              <div key={m.key} style={{ minWidth: 200, flex: '0 1 200px' }}>
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--text-dim)',
                    marginBottom: 12,
                  }}
                >
                  {m.place != null ? `${ordinal(m.place)} Place` : 'Placement Game'}
                </div>
                <MatchupBox m={m} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
