import { useMemo, useState } from 'react'
import { displayName, SEASON_YEARS } from '../data/league'
import { buildHeadToHead, pairGames } from '../lib/h2h'
import { num, record } from '../lib/format'

interface SelectedPair {
  row: string
  col: string
}

export function HeadToHead() {
  const [includePlayoffs, setIncludePlayoffs] = useState(true)
  const [selected, setSelected] = useState<SelectedPair | null>(null)

  const matrix = useMemo(() => buildHeadToHead(includePlayoffs), [includePlayoffs])

  const managers = useMemo(
    () => Object.keys(matrix).sort((a, b) => displayName(a).localeCompare(displayName(b))),
    [matrix],
  )

  const games = useMemo(
    () => (selected ? pairGames(selected.row, selected.col, includePlayoffs) : []),
    [selected, includePlayoffs],
  )

  return (
    <>
      <div className="eyebrow">Rivalries</div>
      <h1 className="page-title">Head-to-Head Records</h1>
      <p className="page-sub">
        Every manager's all-time record against every other, built from real weekly matchup
        data across all {SEASON_YEARS.length} seasons ({SEASON_YEARS[0]}–
        {SEASON_YEARS[SEASON_YEARS.length - 1]}) — both the ESPN era and the Sleeper era. Read
        each row as “this manager vs. the column.” Click any cell to see the full game-by-game
        history for that matchup.
      </p>

      <div className="section" style={{ marginTop: 24 }}>
        <div className="row-between" style={{ marginBottom: 16 }}>
          <label className="muted" style={{ fontSize: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={includePlayoffs}
              onChange={(e) => setIncludePlayoffs(e.target.checked)}
            />
            Include playoff games
          </label>
        </div>

        {managers.length > 0 && (
          <div className="h2h-scroll" style={{ marginTop: 16 }}>
            <table className="h2h">
              <thead>
                <tr>
                  <th className="corner" style={{ position: 'sticky', top: 0, left: 0 }}>
                    vs →
                  </th>
                  {managers.map((m) => (
                    <th key={m} title={displayName(m)}>
                      {displayName(m).split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {managers.map((row) => (
                  <tr key={row}>
                    <th title={displayName(row)}>{displayName(row)}</th>
                    {managers.map((col) => {
                      if (row === col) return <td key={col} className="diag">—</td>
                      const cell = matrix[row]?.[col]
                      if (!cell || cell.w + cell.l + cell.t === 0)
                        return (
                          <td key={col} className="muted">
                            ·
                          </td>
                        )
                      const cls = cell.w > cell.l ? 'win' : cell.w < cell.l ? 'loss' : ''
                      const isSelected = selected?.row === row && selected?.col === col
                      return (
                        <td
                          key={col}
                          className={cls}
                          style={{
                            cursor: 'pointer',
                            outline: isSelected ? '2px solid var(--gold-soft)' : undefined,
                            outlineOffset: isSelected ? '-2px' : undefined,
                          }}
                          onClick={() =>
                            setSelected(isSelected ? null : { row, col })
                          }
                        >
                          {record(cell.w, cell.l, cell.t)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selected && (
          <div className="card" style={{ marginTop: 24, padding: 20 }}>
            <div className="row-between" style={{ marginBottom: 12 }}>
              <h2 style={{ margin: 0 }}>
                {displayName(selected.row)} vs. {displayName(selected.col)}
              </h2>
              <button className="chip" style={{ cursor: 'pointer' }} onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
            {(() => {
              const cell = matrix[selected.row]?.[selected.col]
              if (!cell) return null
              return (
                <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
                  All-time record: <strong>{record(cell.w, cell.l, cell.t)}</strong> · Points for{' '}
                  <strong>{num(cell.pf)}</strong>, points against <strong>{num(cell.pa)}</strong>
                </p>
              )
            })()}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Season</th>
                    <th>Week</th>
                    <th>Phase</th>
                    <th>Score</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((g) => (
                    <tr key={`${g.season}-${g.week}-${g.phase}`}>
                      <td>{g.season}</td>
                      <td>{g.week}</td>
                      <td>
                        {g.phase === 'playoff' ? (
                          <span className="chip">{g.consolation ? 'Consolation' : 'Playoffs'}</span>
                        ) : (
                          <span className="muted">Regular</span>
                        )}
                      </td>
                      <td className="num">
                        {num(g.pf)} – {num(g.pa)}
                      </td>
                      <td className={g.result === 'W' ? 'pos' : g.result === 'L' ? 'neg' : ''}>
                        {g.result}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
