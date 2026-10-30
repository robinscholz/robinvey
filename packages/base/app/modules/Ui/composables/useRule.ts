// ABC Areal has no asterisk operator; it comes from the system-ui fallback,
// where it sits on the same axis as the plus and at about its size.
const GLYPHS = ['∗', '–', '+', '×', '#', '%', '=']

export function useRule() {
  // Public state
  // One glyph for every rule on the page; empty until drawn, so a rule keeps
  // its line without one.
  const glyph = useState('ui-rule-glyph', () => '')

  // Public functions
  function draw() {
    glyph.value = GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? ''
  }

  return {
    glyph,
    draw,
  }
}

export type UseRuleReturn = ReturnType<typeof useRule>
