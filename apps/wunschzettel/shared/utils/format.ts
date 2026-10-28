const priceFormat = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
})

const longMonthFormat = new Intl.DateTimeFormat('de-DE', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

// A whole amount keeps no decimals: 80 €, but 79,95 €.
export function formatPrice(amount: number): string {
  return priceFormat.format(amount).replace(',00', '')
}

export function formatLongMonth(isoDate: string): string {
  return longMonthFormat.format(new Date(isoDate))
}

// The shop as its address reads, bergzeit.de for https://www.bergzeit.de/p/…
export function formatHost(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return ''
  }
}

interface CaptionPayload {
  shop: string
  price: string
}

// The line under a wish: bergzeit.de, 63,20 €, or whichever of the two is
// there.
export function formatCaption({ shop, price }: CaptionPayload): string {
  return [shop, price].filter(Boolean).join(', ')
}
