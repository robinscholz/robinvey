// ABC Areal has no asterisk operator; it comes from the system-ui fallback,
// where it sits on the same axis as the plus and at about its size.
const GLYPHS = ['∗', '–', '+', '×', '#', '%', '=']

export function useRule() {
  // Public state
  const glyphs = useState<Array<string>>('ui-rule-glyphs', () => [])

  // Public functions
  function shuffle() {
    glyphs.value = GLYPHS.map((glyph) => ({ glyph, key: Math.random() }))
      .sort((first, second) => first.key - second.key)
      .map(({ glyph }) => glyph)
  }

  // Empty until shuffled, so a rule keeps its line without a glyph.
  function glyph(position: number): string {
    return glyphs.value[position % GLYPHS.length] ?? ''
  }

  return {
    glyphs,
    shuffle,
    glyph,
  }
}

export type UseRuleReturn = ReturnType<typeof useRule>
