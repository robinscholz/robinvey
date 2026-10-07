import { Padding, span, Text } from '@jasy/pdf'
import type { PDFElement } from '@jasy/pdf'

interface RuleGlyph {
  char: string
  advance: number
  inkLeft: number
  inkRight: number
  inkBottom: number
  inkTop: number
}

interface RulePayload {
  glyph: RuleGlyph
  color: string
  width: number
  size: number
}

// Metrics of the embedded ABCArealSemiMonoRegular.ttf, in em. The PDF engine
// does not measure text for its callers, and the face is fixed, so they are
// read from it once. The site sets its asterisk rule in ∗ from the system
// font; the CV embeds only ABC Areal, so it uses *.
const CAP_HEIGHT = 0.716

export const RULE_GLYPHS: Array<RuleGlyph> = [
  {
    char: '*',
    advance: 0.503,
    inkLeft: 0.091,
    inkRight: 0.414,
    inkBottom: 0.413,
    inkTop: 0.716,
  },
  {
    char: '–',
    advance: 0.636,
    inkLeft: 0.04,
    inkRight: 0.596,
    inkBottom: 0.24,
    inkTop: 0.31,
  },
  {
    char: '+',
    advance: 0.595,
    inkLeft: 0.065,
    inkRight: 0.53,
    inkBottom: 0.116,
    inkTop: 0.589,
  },
  {
    char: '#',
    advance: 0.622,
    inkLeft: 0.043,
    inkRight: 0.58,
    inkBottom: -0.012,
    inkTop: 0.728,
  },
  {
    char: '%',
    advance: 0.714,
    inkLeft: 0.021,
    inkRight: 0.693,
    inkBottom: -0.012,
    inkTop: 0.728,
  },
  {
    char: '=',
    advance: 0.598,
    inkLeft: 0.068,
    inkRight: 0.532,
    inkBottom: 0.192,
    inkTop: 0.486,
  },
]

// The visible gap between two glyphs, from ink to ink, in em, as on the site.
const GAP = 0.35

// Room above and below the line for a glyph to move into, in em.
const SHIFT = 0.25

// Whole glyphs with equal gaps of ink between them, the first on the left
// edge and the last on the right. The last glyph is its own run, so no
// spacing trails it past the edge.
export function rule({ glyph, color, width, size }: RulePayload): PDFElement {
  const advance = glyph.advance * size
  const ink = (glyph.inkRight - glyph.inkLeft) * size
  const tracking = Math.max(0, GAP * size - (advance - ink))
  const count = Math.max(
    2,
    Math.floor((width + tracking) / (advance + tracking))
  )
  const spacing = (width - count * advance) / (count - 1)
  // Moves the ink onto the middle of a capital: an asterisk sits near the cap
  // tops, a dash at x-height.
  const offset = ((glyph.inkBottom + glyph.inkTop) / 2 - CAP_HEIGHT / 2) * size
  return Padding(
    { top: SHIFT * size + offset, bottom: SHIFT * size - offset },
    Text(
      [
        span(glyph.char.repeat(count - 1), { letterSpacing: spacing }),
        span(glyph.char),
      ],
      { color }
    )
  )
}
