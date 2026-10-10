export default defineNuxtConfig({
  extends: ['@robinscholz/base'],

  modules: ['@nuxt/content', '~~/app/modules/Profile'],

  content: {
    experimental: { sqliteConnector: 'native' },
  },

  // NUXT_PUBLIC_SITE_URL overrides the origin for previews. `updatedAt` is
  // the moment of the build, which for a generated site is the moment the
  // content changed.
  runtimeConfig: {
    public: {
      siteUrl: 'https://robinvey.com',
      updatedAt: new Date().toISOString(),
    },
  },

  nitro: {
    prerender: {
      routes: ['/', '/cv.pdf'],
    },
  },

  app: {
    head: {
      link: [{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    },
  },

  // The transformers in shared/ read the collection types Content generates,
  // and the collection schemas sit outside every directory Nuxt checks.
  typescript: {
    sharedTsConfig: { include: ['./content/types.d.ts'] },
    nodeTsConfig: { include: ['../content.config.ts'] },
  },

  devServer: { port: 3000 },
})
