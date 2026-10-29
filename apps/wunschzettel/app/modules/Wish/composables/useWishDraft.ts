import { draftToPayload, draftTransformer, emptyDraft } from '../utils/draft'
import { slugify } from '../utils/slug'
import { useWishToast } from './private/useWishToast'
import type { WishInsert } from '@robinscholz/database'
import type { WishDraft } from '../utils/draft'

interface UseWishDraftOptions {
  save: (wish: WishInsert) => Promise<unknown>
}

const COMPARISONS = [
  {
    label: 'idealo',
    url: 'https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=',
  },
  { label: 'Geizhals', url: 'https://geizhals.de/?fs=' },
  { label: 'Google Shopping', url: 'https://www.google.de/search?tbm=shop&q=' },
]

function today(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function useWishDraft({ save }: UseWishDraftOptions) {
  const route = useRoute()
  const { announceAdded, announceSaveFailure } = useWishToast()

  // Public state
  const draft = reactive<WishDraft>(emptyDraft())
  const received = shallowRef(false)
  const saving = shallowRef(false)

  const wish = computed(() => draftTransformer(draft))
  const complete = computed(() =>
    Boolean(draft.title.trim() && draft.url.trim())
  )
  const id = computed(() => slugify(draft.title) || 'wunsch')

  const comparisons = computed(() => {
    const query = encodeURIComponent(draft.title.trim())
    return COMPARISONS.map(({ label, url }) => ({
      label,
      url: `${url}${query}`,
    }))
  })

  // Private functions
  // The bookmarklet hands the product over in the hash, so it never leaves
  // the browser. The router has decoded the hash once by the time it is read
  // here, which undoes the bookmarklet’s outer encoding.
  function read(hash: string) {
    const params = new URLSearchParams(hash.slice(1))
    if (!params.has('url')) {
      return
    }
    draft.title = params.get('title') ?? ''
    draft.url = params.get('url') ?? ''
    draft.image = params.get('image') ?? ''
    draft.price = params.get('price') ?? ''
    received.value = true
  }

  // Public functions
  async function submit() {
    saving.value = true
    try {
      await save({ id: id.value, ...draftToPayload(draft), added: today() })
      announceAdded()
      await navigateTo('/')
    } catch (error) {
      announceSaveFailure(error)
    } finally {
      saving.value = false
    }
  }

  // The hash never reaches the server, so the draft is read once the router
  // has the real address in the browser.
  watch(() => route.hash, read, { immediate: true })

  return {
    draft,
    received,
    saving,
    wish,
    complete,
    id,
    comparisons,
    submit,
  }
}

export type UseWishDraftReturn = ReturnType<typeof useWishDraft>
