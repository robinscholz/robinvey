import type { WishInsert, WishRecord } from '@robinscholz/database'

export async function useWishes() {
  const { data, refresh } = await useFetch('/api/wishes', {
    key: 'wishes',
    transform: (rows: Array<WishRecord>) => rows.map(wishTransformer),
  })

  // Public state
  const wishes = computed(() => data.value ?? [])

  // Public functions
  // Every page shares the list under one key, so it is refreshed here, right
  // after a change, instead of being left to the next full load.
  async function save(wish: WishInsert) {
    await $fetch(`/api/wishes/${encodeURIComponent(wish.id)}`, {
      method: 'PUT',
      body: wish,
    })
    await refresh()
  }

  async function remove(id: string) {
    await $fetch(`/api/wishes/${encodeURIComponent(id)}`, { method: 'DELETE' })
    await refresh()
  }

  // The list takes the new order at once; if the server refuses it, the
  // stored order comes back.
  async function reorder(ids: Array<string>) {
    const places = new Map(ids.map((id, index) => [id, index]))
    data.value = [...wishes.value].sort(
      (a, b) => (places.get(a.id) ?? -1) - (places.get(b.id) ?? -1)
    )
    try {
      await $fetch('/api/order', { method: 'PUT', body: { ids } })
    } catch (error) {
      await refresh()
      throw error
    }
  }

  return {
    wishes,
    save,
    remove,
    reorder,
  }
}

export type UseWishesReturn = Awaited<ReturnType<typeof useWishes>>
