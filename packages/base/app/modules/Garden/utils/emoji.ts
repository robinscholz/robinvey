type Range = [from: number, to: number]

// The blocks that hold the emoji, as single code points: the old symbol
// blocks and the pictographs, less the skin tone modifiers between them.
// Only code points with emoji presentation are kept, which leaves out text
// symbols and whatever is unassigned.
const BLOCKS: Array<Range> = [
  [0x2600, 0x27bf],
  [0x1f300, 0x1f3fa],
  [0x1f400, 0x1faff],
]

// Families of look-alikes, which would read as repeats on a dot matrix: the
// player buttons, the small and large squares, the clock faces, the
// speakers, the coloured circles, diamonds and triangles, and the coloured
// squares.
const LOOKALIKES: Array<Range> = [
  [0x23e9, 0x23ef],
  [0x23f8, 0x23fa],
  [0x25aa, 0x25ab],
  [0x25fb, 0x25fe],
  [0x2b1b, 0x2b1c],
  [0x1f507, 0x1f50a],
  [0x1f532, 0x1f53d],
  [0x1f550, 0x1f567],
  [0x1f7e0, 0x1f7eb],
]

const EMOJI = /^\p{Emoji_Presentation}$/u

function within(codePoint: number, ranges: Array<Range>): boolean {
  return ranges.some(([from, to]) => codePoint >= from && codePoint <= to)
}

export function listEmoji(): Array<string> {
  return BLOCKS.flatMap(([from, to]) =>
    Array.from({ length: to - from + 1 }, (_, index) => from + index)
  )
    .filter((codePoint) => !within(codePoint, LOOKALIKES))
    .map((codePoint) => String.fromCodePoint(codePoint))
    .filter((symbol) => EMOJI.test(symbol))
}
