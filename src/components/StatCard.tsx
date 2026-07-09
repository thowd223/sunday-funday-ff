import type { ReactNode } from 'react'

export function StatCard({
  label,
  value,
  meta,
}: {
  label: string
  value: ReactNode
  meta?: ReactNode
}) {
  return (
    <div className="card stat">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {meta && <div className="meta">{meta}</div>}
    </div>
  )
}
