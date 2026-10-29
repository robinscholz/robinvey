// Set on <html>; ABC Areal’s MONO axis follows it, from Semi Mono at 50 to
// the Regular cut at 0, the font’s default.
export const TypefaceAttribute = 'data-typeface'

// Set on <html> for the instant the face changes. With reduced motion every
// property eases over a hair of a millisecond, which would hold the new face
// back a frame, past the point where the anchor is measured.
export const TypefaceChangingAttribute = 'data-typeface-changing'

// Where the visitor’s choice is kept between visits.
export const TypefaceStorageKey = 'robinvey-typeface'

export const Typefaces = ['semi-mono', 'regular'] as const

export type Typeface = (typeof Typefaces)[number]

interface TypefaceChangePayload {
  next: Typeface
  anchor?: Element | null
}

const LABELS = {
  'semi-mono': 'Semi Mono',
  regular: 'Regular',
} satisfies Record<Typeface, string>

export function useTypeface() {
  const { run } = useSwitch()

  // Public state
  const typeface = useState<Typeface>('ui-typeface', () => 'semi-mono')
  const label = computed(() => LABELS[typeface.value])

  // Private functions
  // The text above the anchor rewraps in the new face. Scrolling by the
  // difference keeps the anchor where it was on screen, which Safari does not
  // do on its own.
  async function change({ next, anchor }: TypefaceChangePayload) {
    const html = document.documentElement
    const before = anchor?.getBoundingClientRect().top ?? 0
    html.setAttribute(TypefaceChangingAttribute, '')
    typeface.value = next
    await nextTick()
    window.scrollBy(0, (anchor?.getBoundingClientRect().top ?? 0) - before)
    html.removeAttribute(TypefaceChangingAttribute)
  }

  // Public functions
  // The page switches face the way every switch changes it: scrambled,
  // hidden while it changes, and settling back in.
  async function toggle(anchor?: Element | null) {
    const next = typeface.value === 'semi-mono' ? 'regular' : 'semi-mono'
    await run(() => change({ next, anchor }))
  }

  return {
    typeface,
    label,
    toggle,
  }
}

export type UseTypefaceReturn = ReturnType<typeof useTypeface>
