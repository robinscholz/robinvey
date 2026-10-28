export default defineNuxtConfig({
  extends: ['@robinscholz/base'],

  modules: ['@nuxt/content', '~~/app/modules/Wish'],

  content: {
    experimental: { sqliteConnector: 'native' },
  },

  // NUXT_PUBLIC_SITE_URL overrides the origin for previews; the bookmarklet
  // opens it. `updatedAt` is the moment of the build, which for a generated
  // site is the moment the last wish was added.
  runtimeConfig: {
    public: {
      siteUrl: 'https://wunschzettel.robinvey.com',
      repoUrl: 'https://github.com/robinscholz/robinvey',
      updatedAt: new Date().toISOString(),
    },
  },

  // Pinned, as Nitro detects Cloudflare's build machines and would swap in a
  // Worker preset whose generated config takes over `wrangler deploy`.
  nitro: {
    preset: 'static',
    prerender: {
      routes: ['/', '/add'],
    },
  },

  // A wish list for the family, not for search engines.
  app: {
    head: {
      htmlAttrs: { lang: 'de' },
      link: [{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
      meta: [{ name: 'robots', content: 'noindex' }],
    },
  },

  // The transformers in shared/ read the collection types Content generates,
  // and the collection schemas sit outside every directory Nuxt checks.
  typescript: {
    sharedTsConfig: { include: ['./content/types.d.ts'] },
    nodeTsConfig: { include: ['../content.config.ts'] },
  },

  devServer: { port: 3001 },
})
