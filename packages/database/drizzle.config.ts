import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'drizzle-kit'

// Wrangler keeps the local D1 database as a SQLite file under a hashed name,
// next to its own metadata.sqlite.
const LOCAL_D1_DIR =
  '../../apps/wunschzettel/.wrangler/state/v3/d1/miniflare-D1DatabaseObject'

function localDatabaseFile(): string {
  try {
    const file = readdirSync(LOCAL_D1_DIR).find(
      (name) => name.endsWith('.sqlite') && name !== 'metadata.sqlite'
    )
    return file ? join(LOCAL_D1_DIR, file) : ''
  } catch {
    return ''
  }
}

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/schema.ts',
  out: './migrations',
  dbCredentials: {
    url: localDatabaseFile(),
  },
})
