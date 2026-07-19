import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Overview } from './pages/Overview'
import { Seasons } from './pages/Seasons'
import { SeasonDetail } from './pages/SeasonDetail'
import { Champions } from './pages/Champions'
import { HallOfFame } from './pages/HallOfFame'
import { Awards } from './pages/Awards'
import { Managers } from './pages/Managers'
import { ManagerDetail } from './pages/ManagerDetail'
import { HeadToHead } from './pages/HeadToHead'
import { Rivalries } from './pages/Rivalries'
import { RivalryDetail } from './pages/RivalryDetail'
import { Luck } from './pages/Luck'
import { Records } from './pages/Records'
import { DraftHistory } from './pages/DraftHistory'
import { NotFound } from './pages/NotFound'

/**
 * HashRouter keeps deep links working when the built app is served as static
 * files from any path (e.g. GitHub Pages) without server-side rewrites.
 */
export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="seasons" element={<Seasons />} />
          <Route path="seasons/:year" element={<SeasonDetail />} />
          <Route path="champions" element={<Champions />} />
          <Route path="hall-of-fame" element={<HallOfFame />} />
          <Route path="awards" element={<Awards />} />
          <Route path="managers" element={<Managers />} />
          <Route path="managers/:manager" element={<ManagerDetail />} />
          <Route path="head-to-head" element={<HeadToHead />} />
          <Route path="rivalries" element={<Rivalries />} />
          <Route path="rivalries/:a/:b" element={<RivalryDetail />} />
          <Route path="luck" element={<Luck />} />
          <Route path="records" element={<Records />} />
          <Route path="draft-history" element={<DraftHistory />} />
          <Route path="draft-history/:year" element={<DraftHistory />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
