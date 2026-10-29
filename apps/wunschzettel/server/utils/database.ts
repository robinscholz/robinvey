import { env } from 'cloudflare:workers'
import { createDatabase } from '@robinscholz/database'
import type { AppDatabase } from '@robinscholz/database'

// `nuxt dev` shims `cloudflare:workers` with the bindings wrangler emulates.
export function useDatabase(): AppDatabase {
  return createDatabase(env.DB)
}
