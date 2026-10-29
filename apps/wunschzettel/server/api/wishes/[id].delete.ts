import { removeWish } from '@robinscholz/database'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID fehlt' })
  }
  await Promise.all([removeWish(useDatabase(), id), deleteImage(id)])
  setResponseStatus(event, 204)
  return null
})
