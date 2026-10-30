interface YearsPayload {
  start: string
  end?: string
}

interface PeriodPayload {
  start?: string
  end?: string
}

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

export function formatYears({ start, end }: YearsPayload): string {
  const from = start.slice(0, 4)
  const to = end ? end.slice(0, 4) : 'now'
  return from === to ? from : `${from}–${to}`
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
