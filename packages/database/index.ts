export { createDatabase, pingDatabase, runBatch } from './src/client'
export { seedDatabase } from './src/seed'
export { wishes } from './src/schema'
export {
  listWishes,
  readWish,
  removeWish,
  upsertWish,
} from './src/repositories/wishes'
export type { AppDatabase } from './src/client'
export type { WishInsert, WishRecord } from './src/schema'
