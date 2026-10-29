import { readWish } from '@robinscholz/database'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID missing' })
  }
  const wish = await readWish(useDatabase(), id)
  if (!wish) {
    throw createError({ statusCode: 404, statusMessage: 'No wish' })
  }
  return wish
})
