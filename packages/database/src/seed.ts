import { count } from 'drizzle-orm'
import { wishesSeed } from '../seed/wishes'
import { runBatch } from './client'
import { wishes } from './schema'
import type { AppDatabase } from './client'

// Seeded only while empty, so wishes the owner deleted stay deleted; two
// isolates seeding at once skip each other’s rows instead of failing.
export async function seedDatabase(database: AppDatabase): Promise<number> {
  const [row] = await database.select({ total: count() }).from(wishes)
  if ((row?.total ?? 0) > 0) {
    return 0
  }
  await runBatch(
    database,
    wishesSeed.map((wish) =>
      database.insert(wishes).values(wish).onConflictDoNothing()
    )
  )
  return wishesSeed.length
}
