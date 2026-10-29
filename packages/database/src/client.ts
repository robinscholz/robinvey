import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'
import type { D1Database } from '@cloudflare/workers-types'
import type { BatchItem } from 'drizzle-orm/batch'
import type { DrizzleD1Database } from 'drizzle-orm/d1'

export type AppDatabase = DrizzleD1Database<typeof schema>

export type Statement = BatchItem<'sqlite'>

export function createDatabase(binding: D1Database): AppDatabase {
  return drizzle(binding, { schema })
}

export async function pingDatabase(database: AppDatabase): Promise<void> {
  await database.run(sql`select 1`)
}

// D1 has no interactive transactions; a batch is its all-or-nothing unit.
export async function runBatch<StatementType extends Statement>(
  database: AppDatabase,
  statements: Array<StatementType>
): Promise<Array<StatementType['_']['result']>> {
  const [first, ...rest] = statements
  if (!first) {
    return []
  }
  return database.batch([first, ...rest])
}
