import { span } from '@jasy/pdf'
import type { TextStyle } from '@jasy/pdf'

type TextSegment = ReturnType<typeof span>

export interface TypesetPart {
  text: string
  style?: TextStyle
}

interface TypesetPayload {
  parts: Array<TypesetPart>
  size: number
}

interface SpacingPayload {
  char: string
  previous: string
  next: string
  afterNext: string
}

// Optical corrections the font’s kerning leaves, in em. An r is open below
// its arm, so a comma or full stop after it floats; it comes in to meet the
// r. The dash in a range of years gets a thin space either side, as the
// face’s own thin space is nearly a word space. Each correction is a run of
// its own, which drops the font’s pair kerning there, so these are whole
// adjustments rather than additions to it.
const POINT_AFTER_R = -0.11
const RANGE_SPACE = 0.125

const POINT = /^[,.]$/
const WORD = /^\S$/

function spacing({ char, previous, next, afterNext }: SpacingPayload): number {
  if (char === 'r' && POINT.test(next)) {
    return POINT_AFTER_R
  }
  if (next === '–' && WORD.test(char) && WORD.test(afterNext)) {
    return RANGE_SPACE
  }
  if (char === '–' && WORD.test(previous) && WORD.test(next)) {
    return RANGE_SPACE
  }
  return 0
}

// The parts as runs for `Text`, each in its own style, with each corrected
// glyph set apart and carrying its own letter spacing. The corrections read
// across parts, so an r still meets a comma that follows it in another tone.
// Only for text that stays on one line: the engine may break a line wherever
// two runs meet, so a correction inside a wrapping paragraph could split its
// word across lines.
export function typeset({ parts, size }: TypesetPayload): Array<TextSegment> {
  const chars = parts.flatMap(({ text, style = {} }) =>
    [...text].map((char) => ({ char, style }))
  )
  const segments: Array<TextSegment> = []
  let run = ''
  let runStyle: TextStyle = {}
  const flush = () => {
    if (run) {
      segments.push(span(run, runStyle))
      run = ''
    }
  }
  chars.forEach(({ char, style }, index) => {
    const space = spacing({
      char,
      previous: chars[index - 1]?.char ?? '',
      next: chars[index + 1]?.char ?? '',
      afterNext: chars[index + 2]?.char ?? '',
    })
    if (style !== runStyle) {
      flush()
      runStyle = style
    }
    if (space === 0) {
      run += char
      return
    }
    flush()
    segments.push(span(char, { ...style, letterSpacing: space * size }))
  })
  flush()
  return segments
}
