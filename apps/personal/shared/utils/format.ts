interface YearsPayload {
  start: string
  end?: string
}

interface PeriodPayload {
  start?: string
  end?: string
}

interface HoldPayload {
  text: string
  names: Array<string>
}

const NO_BREAK_SPACE = '\u00A0'

const monthFormat = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const longMonthFormat = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

// Content dates are a year (YYYY) or a month (YYYY-MM), and a year prints as
// itself, so nothing claims a month nobody wrote down.
function formatPoint(value: string): string {
  return value.length === 4
    ? value
    : monthFormat.format(new Date(`${value}-01T00:00:00Z`))
}

// The dash gets a thin space either side.
export function formatYears({ start, end }: YearsPayload): string {
  const from = start.slice(0, 4)
  const to = end ? end.slice(0, 4) : 'now'
  return from === to ? from : `${from}\u2009–\u2009${to}`
}

export function formatMonth(isoDate: string): string {
  return monthFormat.format(new Date(isoDate))
}

export function formatPeriod({ start, end }: PeriodPayload): string {
  const to = end ? formatPoint(end) : 'now'
  if (!start) {
    return to
  }
  const from = formatPoint(start)
  return from === to ? from : `${from}–${to}`
}

export function formatLongMonth(isoDate: string): string {
  return longMonthFormat.format(new Date(isoDate))
}

export function formatLink(url: string): string {
  const { host, pathname } = new URL(url)
  return `${host.replace(/^www\./, '')}${pathname}`.replace(/\/$/, '')
}

// The names in a text stay on one line: their spaces become no-break spaces,
// which neither a browser nor the PDF engine breaks at.
export function holdNames({ text, names }: HoldPayload): string {
  return names.reduce(
    (result, name) =>
      result.replaceAll(name, name.replaceAll(' ', NO_BREAK_SPACE)),
    text
  )
}

interface SplitWords {
  head: string
  tail: string
}

// A text in two: everything up to its last word, and the last word, so a
// mark after the text can be kept on the last word’s line.
export function splitLastWord(text: string): SplitWords {
  const at = text.lastIndexOf(' ')
  return at > 0
    ? { head: text.slice(0, at), tail: text.slice(at + 1) }
    : { head: '', tail: text }
}
