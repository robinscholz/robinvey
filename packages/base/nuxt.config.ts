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
    '@nuxtjs/color-mode',
    '@nuxt/fonts',
    '@nuxt/icon',
    join(currentDir, 'app/modules/Ui'),
    join(currentDir, 'app/modules/Garden'),
  ],

  vueEquipment: {
    plugins: ['MagicAccordion', 'MagicMarquee', 'MagicMenu', 'MagicTray'],
  },

  // The face is the file in public/fonts, named with its weight range so the
  // local provider reads it as one variable face. Nuxt Fonts declares it,
  // preloads it and reads its metrics to set fallbacks after it that take up
  // the same room, so the text holds still when the face arrives.
  fonts: {
    families: [
      {
        name: 'ABC Areal',
        provider: 'local',
        weights: ['400 700'],
        styles: ['normal'],
      },
    ],
  },

  // Icons are inlined while the pages prerender; a slow answer from the
  // endpoint must not leave a mark out of the HTML.
  icon: {
    mode: 'svg',
    componentName: 'NuxtIcon',
    iconifyApiEndpoint: 'https://symbols.maas.earth',
    fetchTimeout: 5000,
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
