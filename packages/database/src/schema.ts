import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// `image_source` is the picture’s address on the shop; `image_version`
// changes whenever the source does, so the picture’s own address changes
// with it and every cache lets go of the old one. `image_transparent` says
// whether the stored copy came with transparency, null until it is checked.
export const wishes = sqliteTable('wishes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  shop: text('shop').notNull().default(''),
  price: real('price'),
  imageSource: text('image_source').notNull().default(''),
  imageVersion: integer('image_version').notNull().default(0),
  imageTransparent: integer('image_transparent', { mode: 'boolean' }),
  note: text('note').notNull().default(''),
  added: text('added').notNull().default(''),
})

export type WishRecord = typeof wishes.$inferSelect
export type WishInsert = typeof wishes.$inferInsert
