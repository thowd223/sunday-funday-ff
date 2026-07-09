import { NavLink, Outlet } from 'react-router-dom'
import { LEAGUE_NAME } from '../data/league'

const LINKS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/seasons', label: 'Seasons' },
  { to: '/champions', label: 'Champions' },
  { to: '/hall-of-fame', label: 'Hall of Fame' },
  { to: '/awards', label: 'Awards' },
  { to: '/head-to-head', label: 'Head-to-Head' },
]

export function Layout() {
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
        <nav className="nav">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="container">
        <Outlet />
      </main>
      <footer className="footer">
        {LEAGUE_NAME} · 14 seasons (2012–2025) · ESPN era manually curated, Sleeper era from
        the public Sleeper API.
      </footer>
    </div>
  )
}
