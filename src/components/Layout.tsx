import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LEAGUE_NAME } from '../data/league'

const LINKS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/seasons', label: 'Seasons' },
  { to: '/hall-of-fame', label: 'Hall of Fame' },
  { to: '/awards', label: 'Awards' },
  { to: '/managers', label: 'Managers' },
  { to: '/head-to-head', label: 'Head-to-Head' },
  { to: '/rivalries', label: 'Rivalries' },
  { to: '/luck', label: 'Luck Index' },
  { to: '/draft-history', label: 'Draft History' },
  { to: '/draft-grades', label: 'Draft Grades' },
  { to: '/trades', label: 'Trades' },
  { to: '/stories', label: 'Stories' },
]

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // Close the mobile menu on every navigation.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="app">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="mark" aria-hidden>
            🏈
          </span>
          <span>
            {LEAGUE_NAME}
            <small>League Chronicle</small>
          </span>
        </NavLink>
        <button
          type="button"
          className="nav-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav className={`nav${menuOpen ? ' nav-open' : ''}`}>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      {menuOpen && (
        <div className="nav-backdrop" onClick={() => setMenuOpen(false)} aria-hidden />
      )}
      <main className="container">
        <Outlet />
      </main>
      <footer className="footer">
        {LEAGUE_NAME} · 14 seasons (2012–2025) · Born on ESPN in 2012, living on Sleeper since
        2019.
      </footer>
    </div>
  )
}
