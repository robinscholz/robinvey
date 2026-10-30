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
      { name: 'useSwitch', from: resolver.resolve('./composables/useSwitch') },
      {
        name: 'useThemeColor',
        from: resolver.resolve('./composables/useThemeColor'),
      },
    ])
  },
})
