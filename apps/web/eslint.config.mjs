import { nuxtPreset } from '@maas/config/eslint-nuxt-preset.mjs'

export default [
  ...nuxtPreset,
  { ignores: ['.data', '.nuxt', '.output', 'node_modules'] },
]
