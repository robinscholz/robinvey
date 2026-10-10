import { scramble, ScrambleSelector } from '../utils/scramble'

// Set on <html>; ABC Areal’s MONO axis follows it, from Semi Mono at 50 to
// the Regular cut at 0, the font’s default.
export const TypefaceAttribute = 'data-typeface'

// Set on <html> while the face changes; the page fades out, and back in once
// the new face is in place.
export const TypefaceFadeAttribute = 'data-typeface-fade'

export type Typeface = 'semi-mono' | 'regular'

type TypefaceFade = 'out' | 'in'

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

  // Public functions
  // The page scrambles and fades out, changes face while it is hidden, and
  // fades back in as noise before the text settles into the new face. The
  // fades fit in the stretch where every glyph is noise, so the switch takes
  // no longer for them. Without motion, the face simply changes.
  async function toggle() {
    if (switching.value) {
      return
    }
    const next = typeface.value === 'semi-mono' ? 'regular' : 'semi-mono'
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      typeface.value = next
      return
    }
    switching.value = true
    fade('out')
    await scramble({
      roots: [...document.querySelectorAll(ScrambleSelector)],
      duration: DURATION,
      onProgress: (progress) => emit('scrambleProgress', progress),
      swap: async () => {
        typeface.value = next
        await nextTick()
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
