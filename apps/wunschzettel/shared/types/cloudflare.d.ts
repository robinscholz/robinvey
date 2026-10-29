// The bindings declared in wrangler.jsonc.
declare module 'cloudflare:workers' {
  export const env: {
    DB: import('@cloudflare/workers-types').D1Database
    IMAGES: import('@cloudflare/workers-types').R2Bucket
  }
}
