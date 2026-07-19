import { useParams } from 'react-router-dom'

export function RivalryDetail() {
  const { a, b } = useParams()
  return (
    <>
      <div className="eyebrow">Grudges</div>
      <h1 className="page-title">
        {a} vs. {b}
      </h1>
      <p className="page-sub">Coming soon.</p>
    </>
  )
}
