import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-06',
  devtools: { enabled: false },
  telemetry: false,

  modules: ['@maas/magic-image', 'nuxt-auth-utils', '~~/app/modules/Wish'],

  // Pictures are cut out and resized by Cloudflare Images on the production
  // zone, from the copies the Worker keeps in its bucket.
  magicImage: {
    image: {
      provider: 'cloudflare',
      cloudflare: { baseURL: 'https://wunschzettel.robinvey.com' },
      // Named so the draft preview’s none provider ships with the build.
      none: {},
    },
  },

  // Straight from the local bucket while developing.
  $development: {
    magicImage: {
      image: {
        provider: 'none',
      },
    },
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  // Only the owner signs in, to add and remove wishes; everyone else reads,
  // so no page ever asks for a session.
  auth: {
    loadStrategy: 'none',
  },

  // NUXT_PUBLIC_SITE_URL overrides the origin for previews; the bookmarklet
  // opens it. NUXT_ALLOWED_GITHUB_IDS lists who may write.
  runtimeConfig: {
    allowedGithubIds: '',
    session: {
      maxAge: 60 * 60 * 24 * 90,
    },
    public: {
      siteUrl: 'https://wunschzettel.robinvey.com',
    },
  },

  // wrangler.jsonc is written by hand: Nitro's generated config would know
  // neither the database nor the bucket.
  nitro: {
    preset: 'cloudflare-module',
    cloudflare: {
      deployConfig: false,
      nodeCompat: true,
    },
  },

  // A wish list for the family, not for search engines.
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
      meta: [{ name: 'robots', content: 'noindex' }],
    },
  },

  devServer: { port: 3001 },
})
