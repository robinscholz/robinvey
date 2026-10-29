import { and, asc, desc, eq, isNull, ne } from 'drizzle-orm'
import { runBatch } from '../client'
import { wishes } from '../schema'
import type { AppDatabase } from '../client'
import type { WishInsert, WishRecord } from '../schema'

// In the owner’s order; wishes not placed yet come first, newest first,
// then by title.
export function listWishes(database: AppDatabase): Promise<Array<WishRecord>> {
  return database
    .select()
    .from(wishes)
    .orderBy(asc(wishes.position), desc(wishes.added), asc(wishes.title))
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

// Wishes with a picture whose copy nobody has checked for transparency yet.
export function listUncheckedImages(
  database: AppDatabase
): Promise<Array<{ id: string }>> {
  return database
    .select({ id: wishes.id })
    .from(wishes)
    .where(and(ne(wishes.imageSource, ''), isNull(wishes.imageTransparent)))
    .all()
}

interface ImageTransparencyPayload {
  id: string
  transparent: boolean
}

export async function setImageTransparency(
  database: AppDatabase,
  { id, transparent }: ImageTransparencyPayload
): Promise<void> {
  await database
    .update(wishes)
    .set({ imageTransparent: transparent })
    .where(eq(wishes.id, id))
    .run()
}

// Every wish in the list gets its place in one batch, so the order is
// stored whole or not at all.
export async function orderWishes(
  database: AppDatabase,
  ids: Array<string>
): Promise<void> {
  await runBatch(
    database,
    ids.map((id, index) =>
      database
        .update(wishes)
        .set({ position: index + 1 })
        .where(eq(wishes.id, id))
    )
  )
}

export async function removeWish(
  database: AppDatabase,
  id: string
): Promise<void> {
  await database.delete(wishes).where(eq(wishes.id, id)).run()
}
