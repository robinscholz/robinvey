import {
  listUncheckedImages,
  seedDatabase,
  setImageTransparency,
} from '@robinscholz/database'
import type { AppDatabase } from '@robinscholz/database'

let prepared: Promise<void> | null = null

// Copies stored before transparency was recorded, or whose wish came in
// through the seed, are read once from the bucket. A copy that is missing
// stays unchecked until the image route fetches it.
async function checkImages(database: AppDatabase): Promise<number> {
  let checked = 0
  for (const { id } of await listUncheckedImages(database)) {
    const head = await readImageHead(id)
    if (head) {
      await setImageTransparency(database, {
        id,
        transparent: hasTransparency(head),
      })
      checked++
    }
  }
  return checked
}

async function prepareDatabase(): Promise<void> {
  const database = useDatabase()
  const seeded = await seedDatabase(database)
  if (seeded > 0) {
    console.info(`[database] seeded ${seeded} wishes`)
  }

  // Unchecked pictures only miss out on their own edges, so a failed check
  // never holds up the API.
  try {
    const checked = await checkImages(database)
    if (checked > 0) {
      console.info(`[database] checked ${checked} pictures for transparency`)
    }
  } catch (error) {
    console.error('[database] could not check the pictures', error)
  }
}

// Once per isolate, before the first API call: seeds an empty database and
// checks the pictures nobody has checked. Migrations run before a deploy
// instead.
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
