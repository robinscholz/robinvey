import { nuxtPreset } from '@maas/config/eslint-nuxt-preset.mjs'

export default [
  ...nuxtPreset,
  { ignores: ['.maas', '.nuxt', 'node_modules', 'tokens'] },
]
