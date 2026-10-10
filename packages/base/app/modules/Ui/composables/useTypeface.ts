import { scramble, ScrambleSelector } from '../utils/scramble'

// Set on <html>; ABC Areal’s MONO axis follows it, from Semi Mono at 50 to
// the Regular cut at 0, the font’s default.
export const TypefaceAttribute = 'data-typeface'

// Set on <html> while the face changes; the page fades out, and back in once
// the new face is in place.
export const TypefaceFadeAttribute = 'data-typeface-fade'

// Set on <html> for the instant the face changes. With reduced motion every
// property eases over a hair of a millisecond, which would hold the new face
// back a frame, past the point where the anchor is measured.
export const TypefaceChangingAttribute = 'data-typeface-changing'

export type Typeface = 'semi-mono' | 'regular'

type TypefaceFade = 'out' | 'in'

interface TypefaceChangePayload {
  next: Typeface
  anchor?: Element | null
}

const LABELS = {
  'semi-mono': 'Semi Mono',
  regular: 'Regular',
} satisfies Record<Typeface, string>

const DURATION = 600

export function useTypeface() {
  const { emit } = useUiEmitter()

  // Private state
  const switching = useState('ui-typeface-switching', () => false)

  // Public state
  const typeface = useState<Typeface>('ui-typeface', () => 'semi-mono')
  const label = computed(() => LABELS[typeface.value])

  // Private functions
  function fade(direction?: TypefaceFade) {
    const html = document.documentElement
    if (!direction) {
      html.removeAttribute(TypefaceFadeAttribute)
      return
    }
    html.setAttribute(TypefaceFadeAttribute, direction)
  }

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
  // The page scrambles and fades out, changes face while it is hidden, and
  // fades back in as noise before the text settles into the new face. The
  // fades fit in the stretch where every glyph is noise, so the switch takes
  // no longer for them. Without motion, the face simply changes.
  async function toggle(anchor?: Element | null) {
    if (switching.value) {
      return
    }
    const next = typeface.value === 'semi-mono' ? 'regular' : 'semi-mono'
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await change({ next, anchor })
      return
    }
    switching.value = true
    fade('out')
    await scramble({
      roots: [...document.querySelectorAll(ScrambleSelector)],
      duration: DURATION,
      onProgress: (progress) => emit('scrambleProgress', progress),
      swap: async () => {
        await change({ next, anchor })
        fade('in')
      },
    })
    fade()
    switching.value = false
  }

  return {
    typeface,
    label,
    toggle,
  }
}

export type UseTypefaceReturn = ReturnType<typeof useTypeface>
