import { bookmarkletCode } from '#build/wish/bookmarklet'

export function useBookmarklet() {
  const { siteUrl } = useRuntimeConfig().public

  // Public state
  // Percent-encoded, so no character of the code reads as an escape when the
  // browser runs the address.
  const href = computed(() => {
    const origin = siteUrl.replace(/\/$/, '')
    const code = bookmarkletCode.replace('__WISH_ORIGIN__', origin)
    return `javascript:${encodeURIComponent(code)}`
  })

  return {
    href,
  }
}

export type UseBookmarkletReturn = ReturnType<typeof useBookmarklet>
