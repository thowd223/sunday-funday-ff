import type { PlayoffResult } from '../data/league'

const CLASS: Record<PlayoffResult, string> = {
  Champion: 'result-champion',
  'Runner-Up': 'result-runner-up',
  '3rd Place': 'result-3rd-place',
  '4th Place': 'result-4th-place',
  'Made Playoffs': 'result-made-playoffs',
  'Missed Playoffs': 'result-missed-playoffs',
}

const ICON: Partial<Record<PlayoffResult, string>> = {
  Champion: '🏆',
  'Runner-Up': '🥈',
  '3rd Place': '🥉',
}

export function ResultBadge({ result }: { result: PlayoffResult }) {
  return (
    <span className={`pill ${CLASS[result]}`}>
      {ICON[result] && <span aria-hidden>{ICON[result]}</span>}
      {result}
    </span>
  )
}
