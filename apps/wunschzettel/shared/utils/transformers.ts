import { formatCaption, formatHost, formatPrice } from './format'
import type { WishInsert, WishRecord } from '@robinscholz/database'

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function amount(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

// Pictures are served from the Worker’s own copy; the version in the address
// changes with the source, so caches let go of a replaced picture.
export function wishTransformer(item: WishRecord) {
  const shop = item.shop || formatHost(item.url)
  const price = item.price === null ? '' : formatPrice(item.price)
  return {
    id: item.id,
    title: item.title,
    url: item.url,
    caption: formatCaption({ shop, price }),
    image: item.imageSource ? `/images/${item.id}/${item.imageVersion}` : '',
    imageTransparent: item.imageTransparent === true,
    note: item.note,
  }
}

// What the server stores from whatever the add page sends.
export function toWishForStorage(raw: Record<string, unknown>): WishInsert {
  return {
    id: text(raw.id),
    title: text(raw.title),
    url: text(raw.url),
    shop: text(raw.shop),
    price: amount(raw.price),
    imageSource: text(raw.imageSource),
    note: text(raw.note),
    added: text(raw.added),
  }
}

export type Wish = ReturnType<typeof wishTransformer>
