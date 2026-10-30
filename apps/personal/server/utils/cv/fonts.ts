import type { FontFamily } from '@jasy/pdf'

// The face the CV and the preview image share: Mirage, cut from the variable
// font at 400 and the CV’s optical size by `scripts/cv-font.py`, with the
// site’s stylistic sets written into its character map.
export const CV_FONT = 'Mirage'
export const CV_FONT_FILE = 'Mirage.ttf'

export async function loadCvFonts(): Promise<Record<string, FontFamily>> {
  const mirage = await readFont(CV_FONT_FILE)
  return { [CV_FONT]: { normal: mirage } }
}
