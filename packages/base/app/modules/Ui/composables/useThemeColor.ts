// The paper and the dark ground as sRGB: `app.color.surface.bg.base` in each
// mode, for the browser’s own frame around the page, which cannot read the
// tokens.
const PAPER = '#f2f2f0'
const GROUND = '#161615'

type ThemeColorMode = 'light' | 'dark'

function colorOf(mode: ThemeColorMode): string {
  return mode === 'dark' ? GROUND : PAPER
}

// Sets the browser’s theme colour: one tag per system scheme, so the first
// paint is right before the app has read the visitor’s choice, and both
// carry that choice once there is one.
export function useThemeColor() {
  const colorMode = useColorMode()

  // Private state
  const chosen = computed(() => {
    const preference = colorMode.preference
    return preference === 'dark' || preference === 'light'
      ? colorOf(preference)
      : undefined
  })

  useHead({
    meta: [
      {
        key: 'theme-color-light',
        name: 'theme-color',
        media: '(prefers-color-scheme: light)',
        content: () => chosen.value ?? PAPER,
      },
      {
        key: 'theme-color-dark',
        name: 'theme-color',
        media: '(prefers-color-scheme: dark)',
        content: () => chosen.value ?? GROUND,
      },
    ],
  })
}

export type UseThemeColorReturn = ReturnType<typeof useThemeColor>
