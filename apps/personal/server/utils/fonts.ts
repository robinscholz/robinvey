// A font file from server/assets/fonts, as the CV and the preview image
// embed them.
export async function readFont(fileName: string): Promise<Uint8Array> {
  const bytes = await useStorage('assets:server').getItemRaw(
    `fonts:${fileName}`
  )
  if (!(bytes instanceof Uint8Array)) {
    throw createError({
      statusCode: 500,
      statusMessage: `${fileName} is missing from server/assets/fonts`,
    })
  }
  return bytes
}
