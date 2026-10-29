import { readWish } from '@robinscholz/database'

// The copy in the bucket, fetched from the shop on first request when the
// save could not get it. The version in the address only tells caches apart.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 404, statusMessage: 'Kein Bild' })
  }

  let image = await readImage(id)
  if (!image) {
    const wish = await readWish(useDatabase(), id)
    if (!wish?.imageSource) {
      throw createError({ statusCode: 404, statusMessage: 'Kein Bild' })
    }
    if (!(await storeImage({ id, source: wish.imageSource }))) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Das Bild ist beim Shop nicht zu bekommen',
      })
    }
    image = await readImage(id)
  }
  if (!image) {
    throw createError({ statusCode: 404, statusMessage: 'Kein Bild' })
  }

  setHeaders(event, {
    'Content-Type': image.contentType,
    'Cache-Control': 'public, max-age=31536000, immutable',
    ETag: image.etag,
  })
  return new Uint8Array(image.bytes)
})
