import { MANAGERS, SEASONS, SEASON_YEARS, TRADE_HISTORY, type Trade } from '../data/league'

/**
 * Trade history analysis for "The Market" — the league-wide trade page.
 *
 * Data provenance: Sleeper's public transactions API, which only goes back to
 * the 2019 season (the league's first year on Sleeper). ESPN's API no longer
 * serves historical transaction data for 2012-2018, so those seasons are not
 * "zero trades" — they're simply undocumented. Every function here operates
 * only over TRADE_HISTORY (2019-2025) and callers should say so in the UI.
 */

/** First and last season present in TRADE_HISTORY, in ascending order. */
export const TRADE_SEASONS: number[] = Object.keys(TRADE_HISTORY)
  .map(Number)
  .sort((a, b) => a - b)

// ---------- Item classification ----------

/** What kind of asset a `received` string represents. */
export type AssetKind = 'player' | 'faab' | 'draftPick' | 'defense'

const DRAFT_PICK_RE = /\b(round|pick|\d(st|nd|rd|th))\b/i

/** Classify a single "received" string (e.g. "Zach Ertz (TE)", "$32 FAAB", "2024 3rd Round Pick"). */
export function classifyAsset(item: string): AssetKind {
  if (/FAAB/i.test(item)) return 'faab'
  if (/\(DEF\)/.test(item)) return 'defense'
  if (DRAFT_PICK_RE.test(item) && !/\(/.test(item)) return 'draftPick'
  return 'player'
}

/** True if the item is a real roster asset (player/DEF/pick) rather than FAAB cash. */
export function isRosterAsset(item: string): boolean {
  return classifyAsset(item) !== 'faab'
}

// ---------- Flattened trade record ----------

export interface FlatTrade {
  season: number
  week: number
  trade: Trade
  /** Total count of received items across all parties (players + picks + FAAB entries). */
  totalAssets: number
}

/** Every trade across all Sleeper-era seasons, flattened with season attached, oldest first. */
export function allTrades(): FlatTrade[] {
  const out: FlatTrade[] = []
  for (const season of TRADE_SEASONS) {
    for (const trade of TRADE_HISTORY[String(season)] ?? []) {
      const totalAssets = trade.parties.reduce((sum, p) => sum + p.received.length, 0)
      out.push({ season, week: trade.week, trade, totalAssets })
    }
  }
  return out.sort((a, b) => a.season - b.season || a.week - b.week)
}

// ---------- League totals ----------

export interface SeasonTradeCount {
  season: number
  count: number
}

export interface LeagueTradeTotals {
  totalTrades: number
  bySeason: SeasonTradeCount[]
  mostActiveSeason: SeasonTradeCount | null
  leastActiveSeason: SeasonTradeCount | null
}

/**
 * League-wide trade volume: total count and a per-season breakdown across
 * every season in TRADE_SEASONS (including seasons with zero trades, so a
 * quiet year like 2024 or 2025 shows up as 0 rather than disappearing).
 */
export function leagueTradeTotals(): LeagueTradeTotals {
  const bySeason: SeasonTradeCount[] = TRADE_SEASONS.map((season) => ({
    season,
    count: (TRADE_HISTORY[String(season)] ?? []).length,
  }))

  const totalTrades = bySeason.reduce((sum, s) => sum + s.count, 0)

  const active = bySeason.filter((s) => s.count > 0)
  const mostActiveSeason =
    active.length > 0 ? active.reduce((a, b) => (b.count > a.count ? b : a)) : null
  const leastActiveSeason =
    bySeason.length > 0 ? bySeason.reduce((a, b) => (b.count < a.count ? b : a)) : null

  return { totalTrades, bySeason, mostActiveSeason, leastActiveSeason }
}

// ---------- Trader profiles ----------

export interface TraderProfile {
  manager: string
  totalTrades: number
  assetsAcquired: number
  assetsShipped: number
  /** Manager traded with most often, and how many times, or null if this manager has never traded. */
  topPartner: { manager: string; count: number } | null
}

/**
 * Per-manager trading activity across every manager in the league (MANAGERS),
 * so a manager who has never made a trade still gets a zeroed-out profile
 * rather than being silently omitted. Ranked most-active to least-active by
 * the caller as needed — this returns unordered profiles keyed off MANAGERS.
 */
export function traderProfiles(): TraderProfile[] {
  const trades = allTrades()

  const totalTrades: Record<string, number> = {}
  const assetsAcquired: Record<string, number> = {}
  const assetsShipped: Record<string, number> = {}
  const partnerCounts: Record<string, Record<string, number>> = {}

  for (const m of MANAGERS) {
    totalTrades[m] = 0
    assetsAcquired[m] = 0
    assetsShipped[m] = 0
    partnerCounts[m] = {}
  }

  for (const { trade } of trades) {
    const parties = trade.parties
    for (const party of parties) {
      totalTrades[party.manager] = (totalTrades[party.manager] ?? 0) + 1
      assetsAcquired[party.manager] = (assetsAcquired[party.manager] ?? 0) + party.received.length

      // Everything the other side(s) received, this manager shipped out.
      const shipped = parties
        .filter((p) => p.manager !== party.manager)
        .reduce((sum, p) => sum + p.received.length, 0)
      assetsShipped[party.manager] = (assetsShipped[party.manager] ?? 0) + shipped

      partnerCounts[party.manager] ??= {}
      for (const other of parties) {
        if (other.manager === party.manager) continue
        partnerCounts[party.manager][other.manager] =
          (partnerCounts[party.manager][other.manager] ?? 0) + 1
      }
    }
  }

  return MANAGERS.map((manager) => {
    const partners = Object.entries(partnerCounts[manager] ?? {})
    const topPartner =
      partners.length > 0
        ? partners
            .map(([m, count]) => ({ manager: m, count }))
            .reduce((a, b) => (b.count > a.count ? b : a))
        : null

    return {
      manager,
      totalTrades: totalTrades[manager] ?? 0,
      assetsAcquired: assetsAcquired[manager] ?? 0,
      assetsShipped: assetsShipped[manager] ?? 0,
      topPartner,
    }
  })
}

/** traderProfiles() ranked most-active to least-active. */
export function traderProfilesRanked(): TraderProfile[] {
  return [...traderProfiles()].sort(
    (a, b) => b.totalTrades - a.totalTrades || a.manager.localeCompare(b.manager),
  )
}

/** Managers who have never made a trade in the Sleeper era. */
export function managersWithNoTrades(): string[] {
  return traderProfiles()
    .filter((p) => p.totalTrades === 0)
    .map((p) => p.manager)
}

// ---------- Trade partnerships ----------

export interface TradePartnership {
  a: string
  b: string
  count: number
}

/**
 * Pairwise trade counts between managers (each pair counted once, a/b order
 * arbitrary but stable), ranked most-traded pair first.
 */
export function tradePartnerships(): TradePartnership[] {
  const counts: Record<string, number> = {}

  for (const { trade } of allTrades()) {
    const managers = trade.parties.map((p) => p.manager)
    for (let i = 0; i < managers.length; i++) {
      for (let j = i + 1; j < managers.length; j++) {
        const [a, b] = [managers[i], managers[j]].sort()
        const key = `${a}|${b}`
        counts[key] = (counts[key] ?? 0) + 1
      }
    }
  }

  return Object.entries(counts)
    .map(([key, count]) => {
      const [a, b] = key.split('|')
      return { a, b, count }
    })
    .sort((x, y) => y.count - x.count)
}

// ---------- Blockbusters ----------

/** Biggest trades by total assets moved (both sides combined), most first. */
export function blockbusterTrades(limit = 8): FlatTrade[] {
  return [...allTrades()].sort((a, b) => b.totalAssets - a.totalAssets).slice(0, limit)
}

// ---------- Deadline behavior ----------

export interface WeekBucket {
  /** Label for the bucket, e.g. "Week 1-4". */
  label: string
  count: number
}

/**
 * Trade volume bucketed by week-of-season, so early-season shuffling can be
 * compared against deadline-week flurries. Buckets follow typical fantasy
 * trade-deadline structure: weeks 1-4 (early), 5-8 (mid), 9-11 (deadline
 * run-up), 12+ (post-deadline / rare).
 */
export function tradesByWeekBucket(): WeekBucket[] {
  const buckets: WeekBucket[] = [
    { label: 'Weeks 1-4', count: 0 },
    { label: 'Weeks 5-8', count: 0 },
    { label: 'Weeks 9-11', count: 0 },
    { label: 'Week 12+', count: 0 },
  ]

  for (const { week } of allTrades()) {
    if (week <= 4) buckets[0].count++
    else if (week <= 8) buckets[1].count++
    else if (week <= 11) buckets[2].count++
    else buckets[3].count++
  }

  return buckets
}

/** Raw trade counts by exact week number, for a finer-grained view if needed. */
export function tradesByWeek(): { week: number; count: number }[] {
  const counts: Record<number, number> = {}
  for (const { week } of allTrades()) {
    counts[week] = (counts[week] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([week, count]) => ({ week: Number(week), count }))
    .sort((a, b) => a.week - b.week)
}

// ---------- Trades that "won" titles ----------

export interface TitleTeamTrades {
  season: number
  champion: string
  runnerUp: string | null
  /** Trades that season involving the champion, runner-up, or both. */
  trades: FlatTrade[]
}

/**
 * For each season with title-game results, the trades made that year by the
 * eventual Champion and Runner-Up. This is presented as "moves made by teams
 * that reached the title game" — a correlation, not a claim that any single
 * trade caused the result.
 */
export function titleTeamTrades(): TitleTeamTrades[] {
  const podiumBySeason = new Map<number, { champion?: string; runnerUp?: string }>()
  for (const row of SEASONS) {
    const entry = podiumBySeason.get(row.season) ?? {}
    if (row.result === 'Champion') entry.champion = row.manager
    if (row.result === 'Runner-Up') entry.runnerUp = row.manager
    podiumBySeason.set(row.season, entry)
  }

  const tradesBySeason = new Map<number, FlatTrade[]>()
  for (const ft of allTrades()) {
    const list = tradesBySeason.get(ft.season) ?? []
    list.push(ft)
    tradesBySeason.set(ft.season, list)
  }

  const out: TitleTeamTrades[] = []
  for (const season of TRADE_SEASONS) {
    const podium = podiumBySeason.get(season)
    if (!podium?.champion) continue
    const seasonTrades = tradesBySeason.get(season) ?? []
    const trades = seasonTrades.filter((ft) =>
      ft.trade.parties.some((p) => p.manager === podium.champion || p.manager === podium.runnerUp),
    )
    out.push({
      season,
      champion: podium.champion,
      runnerUp: podium.runnerUp ?? null,
      trades,
    })
  }

  return out
}

/** True if SEASON_YEARS includes at least one year outside the Sleeper trade-history window. */
export function hasEspnEraGap(): boolean {
  return SEASON_YEARS.some((y) => y < (TRADE_SEASONS[0] ?? Infinity))
}
