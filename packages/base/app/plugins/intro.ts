import { IntroAttribute } from '../modules/Ui/composables/useIntro'

// The page is prerendered and paints its final text before the app hydrates,
// so the text is hidden from the first paint and revealed by the intro.
// Visitors who prefer reduced motion, or have no JavaScript, never hide it.
// The intro waits for hydration to finish, so Vue never sees scrambled text.
export default defineNuxtPlugin((nuxtApp) => {
  useHead({
    script: [
      {
        innerHTML: `matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.setAttribute('${IntroAttribute}', '')`,
        tagPriority: 'critical',
      },
    ],
  })

  if (import.meta.client) {
    const { start } = useIntro()
    nuxtApp.hook('app:suspense:resolve', () => {
      start()
    })
  }
})
