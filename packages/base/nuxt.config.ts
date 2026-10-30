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
    '@nuxt/icon',
    join(currentDir, 'app/modules/Ui'),
    join(currentDir, 'app/modules/EmojiCanvas'),
  ],

  vueEquipment: {
    plugins: [
      'MagicAccordion',
      'MagicDotMatrix',
      'MagicMarquee',
      'MagicMenu',
      'MagicTray',
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

  // Mirage comes from the MaaS font server, as it does on vue.equipment. The
  // sheet is critical, so the face is asked for before anything else.
  app: {
    head: {
      htmlAttrs: { lang: 'en', 'data-theme': 'robinvey' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.maas.engineering',
          crossorigin: 'anonymous',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.maas.engineering/mirage/1.1.3/stylesheet.css',
          crossorigin: 'anonymous',
          tagPriority: 'critical',
        },
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
