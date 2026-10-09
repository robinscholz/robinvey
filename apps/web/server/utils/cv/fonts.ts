import type { FontFamily } from '@jasy/pdf'

const SEMI_MONO = 'ArealSemiMono'
const PROPORTIONAL = 'ArealProportional'
const EMOJI = 'NotoColorEmoji'

// Each character comes from the first face that has it. Semi Mono sets narrow
// glyphs such as brackets in wide cells, which opens gaps around them, so a
// proportional cut carrying only those comes first.
export const CV_FONT = [PROPORTIONAL, SEMI_MONO]

// Emoji are drawn from Noto, as vectors: the engine reads COLR colour fonts,
// and Apple’s emoji are bitmaps it cannot. The file holds only the emoji the
// CV uses, from Google Fonts’ `text=` subset; another emoji means another cut.
// Each glyph’s paint is scaled to 0.907, the site’s emoji size, and lifted on
// its own, as Noto’s drawings end at different depths, so every foot lands
// 0.03em below the baseline instead of hanging a fifth of an em below it.
export const CV_EMOJI_FONT = EMOJI

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

// The PDF engine embeds static faces, so both are instances cut from the
// variable font at 400, the CV’s only weight: Semi Mono at MONO 50, with its
// space narrowed by `scripts/cv-font.py`, and the proportional one at MONO 0,
// subset to the round and square brackets.
export async function loadCvFonts(): Promise<Record<string, FontFamily>> {
  const [semiMono, proportional, emoji] = await Promise.all([
    readFont('ABCArealSemiMonoRegular.ttf'),
    readFont('ABCArealProportional.ttf'),
    readFont('NotoColorEmoji.ttf'),
  ])
  return {
    [SEMI_MONO]: { normal: semiMono },
    [PROPORTIONAL]: { normal: proportional },
    [EMOJI]: { normal: emoji },
  }
}
