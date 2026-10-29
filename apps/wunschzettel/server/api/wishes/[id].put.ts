import { readWish, upsertWish } from '@robinscholz/database'

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

  // A new picture replaces the copy at once, while the shop still has it,
  // and is checked for transparency on the way in. One the shop does not
  // hand out yet is checked when the image route fetches it.
  let imageTransparent = stored?.imageTransparent ?? null
  if (changed) {
    await deleteImage(id)
    const copy = wish.imageSource
      ? await storeImage({ id, source: wish.imageSource })
      : null
    imageTransparent = copy?.transparent ?? null
  }

  return upsertWish(database, {
    ...wish,
    added: wish.added || stored?.added || new Date().toISOString(),
    imageVersion: changed ? Date.now() : (stored?.imageVersion ?? 0),
    imageTransparent,
  })
})
