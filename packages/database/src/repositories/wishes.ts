import { asc, desc, eq } from 'drizzle-orm'
import { wishes } from '../schema'
import type { AppDatabase } from '../client'
import type { WishInsert, WishRecord } from '../schema'

// Newest first, then by title.
export function listWishes(database: AppDatabase): Promise<Array<WishRecord>> {
  return database
    .select()
    .from(wishes)
    .orderBy(desc(wishes.added), asc(wishes.title))
    .all()
}

export function readWish(
  database: AppDatabase,
  id: string
): Promise<WishRecord | undefined> {
  return database.select().from(wishes).where(eq(wishes.id, id)).get()
}

export function upsertWish(
  database: AppDatabase,
  record: WishInsert
): Promise<WishRecord> {
  return database
    .insert(wishes)
    .values(record)
    .onConflictDoUpdate({ target: wishes.id, set: record })
    .returning()
    .get()
}

export async function removeWish(
  database: AppDatabase,
  id: string
): Promise<void> {
  await database.delete(wishes).where(eq(wishes.id, id)).run()
}
