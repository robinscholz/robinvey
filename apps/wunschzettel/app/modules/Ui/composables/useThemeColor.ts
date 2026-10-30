// The page’s white and black as sRGB: `app.color.surface.bg.low` in each
// mode, for the browser’s own frame around the page, which cannot read the
// tokens.
const LIGHT = '#fff'
const DARK = '#000'

type ThemeColorMode = 'light' | 'dark'

function colorOf(mode: ThemeColorMode): string {
  return mode === 'dark' ? DARK : LIGHT
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
        content: () => chosen.value ?? LIGHT,
      },
      {
        key: 'theme-color-dark',
        name: 'theme-color',
        media: '(prefers-color-scheme: dark)',
        content: () => chosen.value ?? DARK,
      },
    ],
  })
}

export type UseThemeColorReturn = ReturnType<typeof useThemeColor>
