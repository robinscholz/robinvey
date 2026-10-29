import { readWish, upsertWish } from '@robinscholz/database'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID missing' })
  }
  const body = await readBody<Record<string, unknown>>(event)
  const wish = toWishForStorage({ ...body, id })
  if (!wish.title || !wish.url) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Title and link are still missing',
    })
  }

  const database = useDatabase()
  const stored = await readWish(database, id)
  const changed = wish.imageSource !== (stored?.imageSource ?? '')
  const record = {
    ...wish,
    added: wish.added || stored?.added || today(),
    imageVersion: changed ? Date.now() : (stored?.imageVersion ?? 0),
  }

  // A new picture replaces the copy at once, while the shop still has it.
  if (changed) {
    await deleteImage(id)
    if (record.imageSource) {
      await storeImage({ id, source: record.imageSource })
    }
  }

  return upsertWish(database, record)
})
