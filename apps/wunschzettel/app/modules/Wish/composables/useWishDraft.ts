import { draftTransformer, parsePrice } from '../utils/draft'
import { slugify } from '../utils/slug'
import { serializeWish } from '../utils/yaml'
import type { WishDraft } from '../utils/draft'

// Where a wish is committed, from the repository root.
const WISHES_DIR = 'apps/wunschzettel/content/wishes'

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

export function useWishDraft() {
  const { repoUrl } = useRuntimeConfig().public

  // Public state
  const draft = reactive<WishDraft>({
    title: '',
    url: '',
    shop: '',
    price: '',
    image: '',
    note: '',
  })
  const received = shallowRef(false)

  const wish = computed(() => draftTransformer(draft))
  const complete = computed(() =>
    Boolean(draft.title.trim() && draft.url.trim())
  )
  const filename = computed(() => `${slugify(draft.title) || 'wunsch'}.yml`)

  const yaml = computed(() =>
    serializeWish({
      title: draft.title.trim(),
      url: draft.url.trim(),
      shop: draft.shop.trim(),
      price: parsePrice(draft.price),
      image: draft.image.trim(),
      note: draft.note.trim(),
      added: today(),
    })
  )

  // GitHub’s new file page takes the name and the content from the address
  // and commits straight to main.
  const commitUrl = computed(() => {
    const params = new URLSearchParams({
      filename: filename.value,
      value: yaml.value,
    })
    return `${repoUrl}/new/main/${WISHES_DIR}?${params}`
  })

  const comparisons = computed(() => {
    const query = encodeURIComponent(draft.title.trim())
    return COMPARISONS.map(({ label, url }) => ({
      label,
      url: `${url}${query}`,
    }))
  })

  // Public functions
  // The bookmarklet hands the product over in the hash, so it never leaves
  // the browser.
  function read() {
    const params = new URLSearchParams(location.hash.slice(1))
    if (!params.has('url')) {
      return
    }
    draft.title = params.get('title') ?? ''
    draft.url = params.get('url') ?? ''
    draft.image = params.get('image') ?? ''
    draft.price = params.get('price') ?? ''
    received.value = true
  }

  async function copy() {
    await navigator.clipboard.writeText(yaml.value)
  }

  return {
    draft,
    received,
    wish,
    complete,
    filename,
    yaml,
    commitUrl,
    comparisons,
    read,
    copy,
  }
}

export type UseWishDraftReturn = ReturnType<typeof useWishDraft>
