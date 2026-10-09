import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

const currentDir = dirname(fileURLToPath(import.meta.url))
const tokensDir = join(currentDir, '.maas/tokens/css')

export default defineNuxtConfig({
  compatibilityDate: '2026-10-06',
  devtools: { enabled: false },
  telemetry: false,

  modules: [
    '@maas/mirror/nuxt',
    '@maas/vue-equipment/nuxt',
    '@maas/magic-image',
    '@nuxtjs/color-mode',
    '@nuxt/icon',
    join(currentDir, 'app/modules/Ui'),
  ],

  vueEquipment: {
    plugins: ['MagicAccordion'],
  },

  magicImage: {
    image: {
      provider: 'maas',
    },
  },

  icon: {
    mode: 'svg',
    componentName: 'NuxtIcon',
    iconifyApiEndpoint: 'https://symbols.maas.earth',
  },

  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
    dataValue: 'color-mode',
    storageKey: 'robinvey-color-mode',
    disableTransition: true,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en', 'data-theme': 'robinvey' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },

  css: [
    join(tokensDir, 'config.css'),
    join(tokensDir, 'application.css'),
    join(tokensDir, 'radii.css'),
    join(tokensDir, 'breakpoint/sm/application.css'),
    join(tokensDir, 'theme/dark/application.css'),
    join(tokensDir, 'theme/robinvey/application.css'),
    join(tokensDir, 'theme/robinvey/dark/application.css'),
    join(currentDir, 'app/assets/css/tailwind.css'),
    join(currentDir, 'app/assets/css/main.css'),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
})
