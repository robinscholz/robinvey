import {
  TypefaceAttribute,
  Typefaces,
  TypefaceStorageKey,
} from '../modules/Ui/composables/useTypeface'

// The face a visitor chose last time is set on <html> before the first paint,
// so the page never shows the default first. The server rendered the default,
// so Vue only takes the stored face once the page has hydrated.
export default defineNuxtPlugin((nuxtApp) => {
  useHead({
    script: [
      {
        innerHTML: `try { var face = localStorage.getItem('${TypefaceStorageKey}'); ${JSON.stringify(Typefaces)}.indexOf(face) > -1 && document.documentElement.setAttribute('${TypefaceAttribute}', face) } catch (error) {}`,
        tagPriority: 'critical',
      },
    ],
  })

  if (!import.meta.client) {
    return
  }

  const { typeface } = useTypeface()

  nuxtApp.hook('app:suspense:resolve', () => {
    const stored = document.documentElement.getAttribute(TypefaceAttribute)
    const face = Typefaces.find((entry) => entry === stored)
    if (face) {
      typeface.value = face
    }
  })

  // Written to <html> directly rather than through useHead, which applies its
  // changes a tick later: the scramble and the rules measure the new face as
  // soon as it switches.
  watch(typeface, (value) => {
    document.documentElement.setAttribute(TypefaceAttribute, value)
    try {
      localStorage.setItem(TypefaceStorageKey, value)
    } catch {
      // Storage can be blocked, in private browsing for one; the face then
      // lasts the visit.
    }
  })
})
