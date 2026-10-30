// The blocks that hold the emoji, as single code points: the old symbol
// blocks and the pictographs, less the skin tone modifiers between them.
// Only code points with emoji presentation are kept, which leaves out text
// symbols and whatever is unassigned.
const BLOCKS: Array<[from: number, to: number]> = [
  [0x2600, 0x27bf],
  [0x1f300, 0x1f3fa],
  [0x1f400, 0x1faff],
]

const EMOJI = /^\p{Emoji_Presentation}$/u

export function listEmoji(): Array<string> {
  return BLOCKS.flatMap(([from, to]) =>
    Array.from({ length: to - from + 1 }, (_, index) =>
      String.fromCodePoint(from + index)
    )
  ).filter((symbol) => EMOJI.test(symbol))
}
