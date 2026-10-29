import { seedDatabase } from '@robinscholz/database'

let prepared: Promise<void> | null = null

async function prepareDatabase(): Promise<void> {
  const seeded = await seedDatabase(useDatabase())
  if (seeded > 0) {
    console.info(`[database] seeded ${seeded} wishes`)
  }
}

// Once per isolate, before the first API call: seeds an empty database.
// Migrations run before a deploy instead.
export default defineEventHandler(async (event) => {
  if (!getRequestURL(event).pathname.startsWith('/api/')) {
    return
  }
  prepared ??= prepareDatabase().catch((error: unknown) => {
    prepared = null
    throw error
  })
  await prepared
})
