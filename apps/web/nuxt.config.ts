export default defineNuxtConfig({
  extends: ['@robinscholz/base'],

  modules: ['@nuxt/content', '~~/app/modules/Profile'],

  content: {
    experimental: { sqliteConnector: 'native' },
    // A link in markdown is a link like any other on the page: NuxtLink sets
    // the rel of an outbound one, instead of the nofollow the parser would.
    build: {
      markdown: {
        rehypePlugins: {
          'rehype-external-links': { options: { rel: [] } },
        },
      },
    },
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

  // Pinned, as Nitro detects Cloudflare's build machines and would swap in a
  // Worker preset whose generated config takes over `wrangler deploy`.
  nitro: {
    preset: 'static',
    prerender: {
      routes: ['/', '/cv.pdf', '/og.png'],
    },
  },

  // The static 404 page boots the app in the browser. Until it has, the
  // template stands in for the error page.
  spaLoadingTemplate: 'spa-loading-template.html',

  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        // Safari takes no SVG icon, so the PNG draws the same emoji for it,
        // and the touch icon sets it on the paper for the home screen. Both
        // come from scripts/icons.swift.
        {
          rel: 'icon',
          href: '/favicon.png',
          type: 'image/png',
          sizes: '96x96',
        },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
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
