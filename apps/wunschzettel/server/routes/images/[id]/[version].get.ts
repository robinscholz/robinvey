import { readWish } from '@robinscholz/database'

// The copy in the bucket, fetched from the shop on first request when the
// save could not get it. The version in the address only tells caches apart.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 404, statusMessage: 'No picture' })
  }

  let image = await readImage(id)
  if (!image) {
    const wish = await readWish(useDatabase(), id)
    if (!wish?.imageSource) {
      throw createError({ statusCode: 404, statusMessage: 'No picture' })
    }
    if (!(await storeImage({ id, source: wish.imageSource }))) {
      throw createError({
        statusCode: 502,
        statusMessage: 'The shop did not hand out the picture',
      })
    }
    image = await readImage(id)
  }
  if (!image) {
    throw createError({ statusCode: 404, statusMessage: 'No picture' })
  }

  setHeaders(event, {
    'Content-Type': image.contentType,
    'Cache-Control': 'public, max-age=31536000, immutable',
    ETag: image.etag,
  })
  return new Uint8Array(image.bytes)
})
