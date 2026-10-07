import fontUrl from '../assets/fonts/ABCArealSuperfamilyVariable.woff2?url'

// One face sets every word on the page, so it is fetched with the document
// rather than after the stylesheet asks for it.
export default defineNuxtPlugin(() => {
  useHead({
    link: [
      {
        rel: 'preload',
        href: fontUrl,
        as: 'font',
        type: 'font/woff2',
        crossorigin: 'anonymous',
      },
    ],
  })
})
