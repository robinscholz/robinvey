// Copies the production wishes into the local D1 database, so a local run
// shows the list as it is online. Run from apps/wunschzettel, where wrangler
// finds wrangler.jsonc and the local state.
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BINDING = 'DB'
const BUCKET = 'wunschzettel-images'

// With --json, wrangler writes its error as JSON too.
function readError({ stdout, stderr }) {
  try {
    const { error } = JSON.parse(stdout.trim())
    const notes = (error.notes ?? []).map((note) => note.text)
    return [error.text, ...notes].join(' ')
  } catch {
    // Plain output, read below.
  }
  const lines = `${stderr}\n${stdout}`
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const index = lines.findIndex((line) => line.includes('[ERROR]'))
  if (index === -1) {
    return lines.at(-1) ?? 'wrangler failed'
  }
  return lines
    .slice(index, index + 2)
    .join(' ')
    .replace(/^✘ \[ERROR\] /, '')
}

function wrangler(args) {
  const { status, stdout, stderr, error } = spawnSync('wrangler', args, {
    encoding: 'utf8',
    env: { ...process.env, FORCE_COLOR: '0' },
  })
  if (error) {
    throw error
  }
  if (status !== 0) {
    throw new Error(readError({ stdout, stderr }))
  }
  return stdout
}

function queryWishes({ location, columns }) {
  const output = wrangler([
    'd1',
    'execute',
    BINDING,
    `--${location}`,
    '--json',
    '--command',
    `SELECT ${columns} FROM wishes`,
  ])
  const [{ results }] = JSON.parse(output)
  return results
}

function toLiteral(value) {
  if (value === null) {
    return 'NULL'
  }
  if (typeof value === 'number') {
    return String(value)
  }
  return `'${String(value).replaceAll("'", "''")}'`
}

function toInsert(row) {
  const columns = Object.keys(row)
  const names = columns.map((column) => `"${column}"`).join(', ')
  const values = columns.map((column) => toLiteral(row[column])).join(', ')
  return `INSERT INTO wishes (${names}) VALUES (${values});`
}

function toSources(rows) {
  return new Map(rows.map((row) => [row.id, row.image_source]))
}

// The bucket keeps a copy per id, made from the picture address of the day.
// Where production has another address, the copy goes and the next request
// fetches the right picture.
function findStalePictures({ before, after }) {
  const ids = new Set([...before.keys(), ...after.keys()])
  return [...ids].filter(
    (id) => (before.get(id) ?? '') !== (after.get(id) ?? '')
  )
}

// A plain read, since `wrangler d1 export` holds up the live database while
// it runs. One file runs as one batch, so the local list is replaced whole or
// not at all.
function pullDatabase(folder) {
  const rows = queryWishes({ location: 'remote', columns: '*' })
  const before = toSources(
    queryWishes({ location: 'local', columns: 'id, image_source' })
  )

  const file = join(folder, 'pull.sql')
  writeFileSync(file, ['DELETE FROM wishes;', ...rows.map(toInsert)].join('\n'))
  wrangler(['d1', 'execute', BINDING, '--local', '--yes', '--file', file])

  const stale = findStalePictures({ before, after: toSources(rows) })
  for (const id of stale) {
    wrangler(['r2', 'object', 'delete', `${BUCKET}/${id}`, '--local'])
  }

  const pictures = stale.length ? `, ${stale.length} pictures to fetch` : ''
  console.info(`[db:pull] ${rows.length} wishes from production${pictures}`)
}

// Offline or signed out of wrangler, the local run goes on with the wishes
// it already has.
const folder = mkdtempSync(join(tmpdir(), 'wunschzettel-pull-'))
try {
  pullDatabase(folder)
} catch (error) {
  const reason = error instanceof Error ? error.message : String(error)
  console.warn(`[db:pull] kept the local wishes: ${reason}`)
} finally {
  rmSync(folder, { recursive: true, force: true })
}
