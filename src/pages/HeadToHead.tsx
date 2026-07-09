import { useMemo, useState } from 'react'
import { displayName } from '../data/league'
import {
  buildHeadToHead,
  SLEEPER_SEASONS,
  type H2HMatrix,
  type H2HProgress,
} from '../lib/sleeper'
import { record } from '../lib/format'

type Status = 'idle' | 'loading' | 'done' | 'error'

export function HeadToHead() {
  const [status, setStatus] = useState<Status>('idle')
  const [matrix, setMatrix] = useState<H2HMatrix | null>(null)
  const [progress, setProgress] = useState<H2HProgress | null>(null)
  const [error, setError] = useState<string>('')

  async function build() {
    setStatus('loading')
    setError('')
    setMatrix(null)
    try {
      const m = await buildHeadToHead((p) => setProgress(p))
      setMatrix(m)
      setStatus('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setStatus('error')
    }
  }

  const managers = useMemo(() => {
    if (!matrix) return []
    return Object.keys(matrix).sort((a, b) => displayName(a).localeCompare(displayName(b)))
  }, [matrix])

  const pctDone = progress ? Math.round((progress.doneWeeks / progress.totalWeeks) * 100) : 0

  return (
    <>
      <div className="eyebrow">Rivalries</div>
      <h1 className="page-title">Head-to-Head Records</h1>
      <p className="page-sub">
        Every manager's all-time record against every other, built from real weekly matchup
        data pulled live from Sleeper (2019–2025 regular seasons — the ESPN era has no
        per-week matchup API). Read each row as “this manager vs. the column.”
      </p>

      <div className="section" style={{ marginTop: 24 }}>
        <div className="row-between" style={{ marginBottom: 16 }}>
          <button className="btn btn-gold" onClick={build} disabled={status === 'loading'}>
            {status === 'loading'
              ? 'Building…'
              : matrix
                ? '↻ Rebuild grid'
                : '⚡ Build grid from Sleeper'}
          </button>
          <span className="muted">
            {SLEEPER_SEASONS[0]}–{SLEEPER_SEASONS[SLEEPER_SEASONS.length - 1]} · ~96 weekly
            fetches
          </span>
        </div>

        {status === 'loading' && (
          <div className="callout">
            Fetching week-by-week matchups…{' '}
            {progress
              ? `${progress.season} week ${progress.week} · ${progress.doneWeeks}/${progress.totalWeeks} weeks`
              : 'reading league settings'}
            <div className="progress">
              <span style={{ width: `${pctDone}%` }} />
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="callout error">
            Couldn't reach the Sleeper API: {error}
            <br />
            This runs entirely in your browser — check your connection and try again.
          </div>
        )}

        {status === 'idle' && (
          <div className="callout">
            Click <strong>Build grid</strong> to compute the matrix. Nothing is fetched until
            you do — the rest of the app works fully offline from bundled data.
          </div>
        )}

        {matrix && managers.length > 0 && (
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
                      return (
                        <td key={col} className={cls}>
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
      </div>
    </>
  )
}
