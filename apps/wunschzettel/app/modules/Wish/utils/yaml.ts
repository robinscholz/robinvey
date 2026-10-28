export interface WishFile {
  title: string
  url: string
  shop: string
  price: number | null
  image: string
  note: string
  added: string
}

// Every string is single-quoted, so a colon in a title cannot start a key and
// a hash cannot start a comment.
function quote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

export function serializeWish(wish: WishFile): string {
  const lines = [
    `title: ${quote(wish.title)}`,
    `url: ${quote(wish.url)}`,
    wish.shop ? `shop: ${quote(wish.shop)}` : '',
    wish.price === null ? '' : `price: ${wish.price}`,
    wish.image ? `image: ${quote(wish.image)}` : '',
    wish.note ? `note: ${quote(wish.note)}` : '',
    `added: ${quote(wish.added)}`,
  ]
  return `${lines.filter(Boolean).join('\n')}\n`
}
