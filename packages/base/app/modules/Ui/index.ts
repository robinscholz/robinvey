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
      { name: 'useHold', from: resolver.resolve('./composables/useHold') },
      { name: 'useHue', from: resolver.resolve('./composables/useHue') },
      { name: 'useRule', from: resolver.resolve('./composables/useRule') },
      { name: 'useIntro', from: resolver.resolve('./composables/useIntro') },
      {
        name: 'useTypeface',
        from: resolver.resolve('./composables/useTypeface'),
      },
      {
        name: 'useUiEmitter',
        from: resolver.resolve('./composables/useUiEmitter'),
      },
    ])
  },
})
