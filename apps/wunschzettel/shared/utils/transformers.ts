import { formatCaption, formatHost, formatPrice } from './format'
import type { ListCollectionItem, WishesCollectionItem } from '@nuxt/content'

export function listTransformer(item: ListCollectionItem | null) {
  return {
    title: item?.title ?? 'Wunschzettel',
    name: item?.name ?? '',
    description: item?.description ?? '',
    intro: item?.intro ?? '',
  }
}

export function wishTransformer(item: WishesCollectionItem) {
  const shop = item.shop ?? formatHost(item.url)
  const price = item.price === undefined ? '' : formatPrice(item.price)
  return {
    id: item.id,
    title: item.title,
    url: item.url,
    caption: formatCaption({ shop, price }),
    image: item.image ?? '',
    note: item.note ?? '',
  }
}

export type List = ReturnType<typeof listTransformer>
export type Wish = ReturnType<typeof wishTransformer>
