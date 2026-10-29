import type { WishRecord } from '@robinscholz/database'

export interface WishDraft {
  title: string
  url: string
  shop: string
  price: string
  image: string
  note: string
}

// Without grouping, so parsePrice reads it back: 1299,90, not 1.299,90.
const amountFormat = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
})

export function emptyDraft(): WishDraft {
  return {
    title: '',
    url: '',
    shop: '',
    price: '',
    image: '',
    note: '',
  }
}

// 63,20 or 63.2, as typed or as the bookmarklet sends it.
export function parsePrice(text: string): number | null {
  const normalized = text.replace(/[^\d,.]/g, '').replace(',', '.')
  const value = Number(normalized)
  return normalized && Number.isFinite(value) ? value : null
}

// A stored wish back in the form, its price as one would type it: 63,20.
export function recordToDraft(record: WishRecord): WishDraft {
  return {
    title: record.title,
    url: record.url,
    shop: record.shop,
    price:
      record.price === null
        ? ''
        : amountFormat.format(record.price).replace(',00', ''),
    image: record.imageSource,
    note: record.note,
  }
}

export function draftToPayload(draft: WishDraft) {
  return {
    title: draft.title.trim(),
    url: draft.url.trim(),
    shop: draft.shop.trim(),
    price: parsePrice(draft.price),
    imageSource: draft.image.trim(),
    note: draft.note.trim(),
  }
}

// The preview shows the shop’s picture itself, before the Worker has a copy.
export function draftTransformer(draft: WishDraft): Wish {
  const price = parsePrice(draft.price)
  return {
    id: 'draft',
    title: draft.title.trim() || 'Untitled',
    url: draft.url.trim(),
    caption: formatCaption({
      shop: draft.shop.trim() || formatHost(draft.url.trim()),
      price: price === null ? '' : formatPrice(price),
    }),
    image: draft.image.trim(),
    imageTransparent: false,
    note: draft.note.trim(),
  }
}
