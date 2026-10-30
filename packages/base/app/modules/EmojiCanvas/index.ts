import { addComponentsDir, createResolver, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: { name: 'EmojiCanvas' },
  setup() {
    const resolver = createResolver(import.meta.url)
    addComponentsDir({
      path: resolver.resolve('./components'),
      pathPrefix: false,
    })
  },
})
