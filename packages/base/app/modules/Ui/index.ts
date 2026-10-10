import {
  addComponentsDir,
  addImports,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'

export default defineNuxtModule({
  meta: { name: 'Ui' },
  setup() {
    const resolver = createResolver(import.meta.url)
    addComponentsDir({
      path: resolver.resolve('./components'),
      pathPrefix: false,
    })
    addImports([
      { name: 'useHue', from: resolver.resolve('./composables/useHue') },
      { name: 'useRule', from: resolver.resolve('./composables/useRule') },
      { name: 'useIntro', from: resolver.resolve('./composables/useIntro') },
      {
        name: 'useUiEmitter',
        from: resolver.resolve('./composables/useUiEmitter'),
      },
    ])
  },
})
