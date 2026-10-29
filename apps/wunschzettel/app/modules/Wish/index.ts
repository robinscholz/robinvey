import { readFile } from 'node:fs/promises'
import {
  addComponentsDir,
  addImports,
  addTemplate,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'
import { transform } from 'esbuild'

export default defineNuxtModule({
  meta: { name: 'Wish' },
  setup() {
    const resolver = createResolver(import.meta.url)
    addComponentsDir({
      path: resolver.resolve('./components'),
      pathPrefix: false,
    })
    addImports([
      {
        name: 'useBookmarklet',
        from: resolver.resolve('./composables/useBookmarklet'),
      },
      {
        name: 'useWishDraft',
        from: resolver.resolve('./composables/useWishDraft'),
      },
      {
        name: 'useWishEditor',
        from: resolver.resolve('./composables/useWishEditor'),
      },
      { name: 'useWishes', from: resolver.resolve('./composables/useWishes') },
    ])

    // The bookmarklet is written as a script in TypeScript and goes out as
    // one line of JavaScript, minified at build time.
    addTemplate({
      filename: 'wish/bookmarklet.ts',
      write: true,
      async getContents() {
        const source = await readFile(
          resolver.resolve('./bookmarklet/index.ts'),
          'utf8'
        )
        const { code } = await transform(source, {
          loader: 'ts',
          format: 'iife',
          minify: true,
          target: 'es2022',
        })
        return `export const bookmarkletCode = ${JSON.stringify(code.trim())}\n`
      },
    })
  },
})
