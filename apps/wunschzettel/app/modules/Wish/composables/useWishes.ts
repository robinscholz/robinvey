export async function useWishes() {
  const { updatedAt } = useRuntimeConfig().public

  const { data } = await useAsyncData('wishes', async () => {
    const [list, wishes] = await Promise.all([
      queryCollection('list').first(),
      queryCollection('wishes')
        .order('added', 'DESC')
        .order('stem', 'ASC')
        .all(),
    ])

    return {
      list: listTransformer(list),
      wishes: wishes.map(wishTransformer),
    }
  })

  // Public state
  const list = computed(() => data.value?.list ?? listTransformer(null))
  const wishes = computed(() => data.value?.wishes ?? [])
  const updated = computed(() => formatLongMonth(updatedAt))

  return {
    list,
    wishes,
    updated,
  }
}

export type UseWishesReturn = Awaited<ReturnType<typeof useWishes>>
