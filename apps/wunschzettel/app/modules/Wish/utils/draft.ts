export interface WishDraft {
  title: string
  url: string
  shop: string
  price: string
  image: string
  note: string
}

// 63,20 or 63.2, as typed or as the bookmarklet sends it.
export function parsePrice(text: string): number | null {
  const normalized = text.replace(/[^\d,.]/g, '').replace(',', '.')
  const value = Number(normalized)
  return normalized && Number.isFinite(value) ? value : null
}

// The preview shows the shop’s picture itself, before the Worker has a copy.
export function draftTransformer(draft: WishDraft): Wish {
  const price = parsePrice(draft.price)
  return {
    id: 'draft',
    title: draft.title.trim() || 'Ohne Titel',
    url: draft.url.trim(),
    caption: formatCaption({
      shop: draft.shop.trim() || formatHost(draft.url.trim()),
      price: price === null ? '' : formatPrice(price),
    }),
    image: draft.image.trim(),
    note: draft.note.trim(),
  }
}
