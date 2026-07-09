import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <div className="eyebrow">404</div>
      <h1 className="page-title">Page not found</h1>
      <p className="page-sub" style={{ margin: '12px auto' }}>
        That page slipped through the waiver wire.
      </p>
      <Link to="/" className="btn btn-gold" style={{ marginTop: 8 }}>
        Back to the Overview
      </Link>
    </div>
  )
}
