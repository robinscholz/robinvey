import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// `image_source` is the picture’s address on the shop; `image_version`
// changes whenever the source does, so the picture’s own address changes
// with it and every cache lets go of the old one. `image_transparent` says
// whether the stored copy came with transparency, null until it is checked.
// `position` is the wish’s place on the list once the owner has dragged it,
// counted from 1; a wish nobody has placed yet holds 0 and goes first.
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
  position: integer('position').notNull().default(0),
})

export type WishRecord = typeof wishes.$inferSelect
export type WishInsert = typeof wishes.$inferInsert
