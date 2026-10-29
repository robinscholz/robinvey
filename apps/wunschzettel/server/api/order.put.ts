import { orderWishes } from '@robinscholz/database'

function isIdList(value: unknown): value is Array<string> {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((id) => typeof id === 'string' && id !== '') &&
    new Set(value).size === value.length
  )
}

// Outside /api/wishes, where a wish could be called `order`.
export default defineEventHandler(async (event) => {
  const body = await readBody<{ ids?: unknown }>(event)
  const ids = body?.ids
  if (!isIdList(ids)) {
    throw createError({
      statusCode: 422,
      statusMessage: 'A list of distinct wish IDs is missing',
    })
  }
  await orderWishes(useDatabase(), ids)
  setResponseStatus(event, 204)
  return null
})
