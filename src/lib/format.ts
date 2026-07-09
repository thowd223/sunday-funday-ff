export const pct = (v: number, digits = 1): string => `${(v * 100).toFixed(digits)}%`

export const signedPct = (v: number, digits = 1): string =>
  `${v >= 0 ? '+' : ''}${(v * 100).toFixed(digits)}%`

export const num = (v: number, digits = 1): string =>
  v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export const int = (v: number): string => v.toLocaleString('en-US')

export const record = (w: number, l: number, t = 0): string =>
  t > 0 ? `${w}-${l}-${t}` : `${w}-${l}`
