import type { FontFamily } from '@jasy/pdf'

export const CV_FONT = 'ArealSemiMono'

async function readFont(fileName: string): Promise<Uint8Array> {
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

// The PDF engine embeds static faces, so this is a Semi Mono instance cut
// from the variable font at 400, the CV’s only weight.
export async function loadCvFonts(): Promise<Record<string, FontFamily>> {
  return {
    [CV_FONT]: { normal: await readFont('ABCArealSemiMonoRegular.ttf') },
  }
}
