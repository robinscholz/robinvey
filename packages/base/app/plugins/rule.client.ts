// The site is prerendered, so an order shuffled on the server would be the
// same for every visitor. Shuffling once the app has hydrated gives each
// page load its own, and the server renders the rules empty. Waiting for
// hydration to finish keeps the empty rules matching the server’s.
export default defineNuxtPlugin((nuxtApp) => {
  const { shuffle } = useRule()

  nuxtApp.hook('app:suspense:resolve', shuffle)
})
