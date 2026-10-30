// The site is prerendered, so a glyph drawn on the server would be the same
// for every visitor. Drawing once the app has hydrated gives each page load
// its own, and the server renders the rules empty. Waiting for hydration to
// finish keeps the empty rules matching the server’s.
export default defineNuxtPlugin((nuxtApp) => {
  const { draw } = useRule()

  nuxtApp.hook('app:suspense:resolve', draw)
})
