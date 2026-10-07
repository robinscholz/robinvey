interface ScramblePayload {
  roots: Array<Element>
  duration: number
  onProgress?: (progress: number) => void
}

interface RepeatPayload {
  char: string
  count: number
  progress: number
}

interface SettlePayload {
  index: number
  length: number
}

interface AdvancesPayload {
  root: Element
  weight: string
}

interface PoolsPayload {
  widths: Map<string, number>
  tolerance: number
}

interface StandIn {
  glyph: string
  delta: number
}

interface ScrambledText {
  node: Text
  chars: Array<string>
  pools: Array<Array<StandIn>>
  lines: Array<string>
  breaks: Set<number>
  breaksAfter: Set<number>
  size: number
  written: string
}

interface CharMark {
  text: ScrambledText
  index: number
}

interface LineDrift {
  drift: number
  count: number
}

interface RenderPayload {
  text: ScrambledText
  progress: number
  drifts: Map<string, LineDrift>
}

interface WritePayload {
  texts: Array<ScrambledText>
  progress: number
}

const LETTERS = [
  ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
]
// Symbols that open a line break, such as - / ? ! } |, are left out, so a
// scrambled word never splits, and so are quotes, which kern against each
// other.
const SYMBOLS = [...'#$%&()*+,.:;<=>@[\\]^_{~']

// The face is semi mono, so the symbols standing in for a letter are only
// those about as wide as it, in em of the text.
const TOLERANCE = 0.07

// Each line is kept no wider than it ends up, and no more than WINDOW
// narrower, so its right edge holds still. Symbols lose the kerning of the
// letters they replace, so after a few stand-ins the line is held KERNING
// narrower to make up for it.
const WINDOW = 0.1
const KERNING = 0.04

// How often the stand-ins change, in milliseconds; every frame reads as noise.
const INTERVAL = 40

const SPACE = /\s/
const DASH = /[-‐–—/]/

function textNodes(root: Element): Array<Text> {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.parentElement?.closest('[aria-hidden="true"], svg')
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT
    },
  })
  const nodes: Array<Text> = []
  while (walker.nextNode()) {
    if (walker.currentNode instanceof Text) {
      nodes.push(walker.currentNode)
    }
  }
  return nodes
}

// Measured in the page rather than on a canvas, which ignores the variable
// font’s axes and would report the widths of another instance.
function advances({ root, weight }: AdvancesPayload): Map<string, number> {
  const probe = document.createElement('div')
  probe.style.cssText = `position: absolute; visibility: hidden; white-space: pre; font-weight: ${weight}`
  const spans = [...LETTERS, ...SYMBOLS].map((char) => {
    const span = document.createElement('span')
    span.textContent = char
    probe.append(span)
    return { char, span }
  })
  root.append(probe)
  const widths = new Map(
    spans.map(({ char, span }) => [char, span.getBoundingClientRect().width])
  )
  probe.remove()
  return widths
}

// A line may not grow wider, so it can only open on a stand-in no wider than
// its letter. The widest letters, such as W, have none within tolerance and
// also take the closest symbol below them.
function pools({
  widths,
  tolerance,
}: PoolsPayload): Map<string, Array<StandIn>> {
  return new Map(
    LETTERS.map((char) => {
      const width = widths.get(char) ?? 0
      const standIns = SYMBOLS.map((glyph) => ({
        glyph,
        delta: (widths.get(glyph) ?? 0) - width,
      }))
      const closest = standIns
        .filter(({ delta }) => delta <= 0)
        .reduce<StandIn | null>(
          (best, standIn) =>
            best && best.delta >= standIn.delta ? best : standIn,
          null
        )
      const pool = standIns.filter(
        (standIn) => Math.abs(standIn.delta) <= tolerance || standIn === closest
      )
      return [char, pool]
    })
  )
}

// The box that lays out a text’s lines: its nearest ancestor that is not
// inline, which includes flex items and spans set to block.
function blockOf(node: Text): Element | null {
  let element = node.parentElement
  while (
    element?.parentElement &&
    getComputedStyle(element).display.startsWith('inline')
  ) {
    element = element.parentElement
  }
  return element
}

// Each word’s line in the settled layout, keyed by its block and its top, as
// texts share lines. A word opens after a space or a dash, where lines may
// break; spaces belong to the word before them.
function measureLines(texts: Array<ScrambledText>) {
  const blocks = new Map<Element, number>()
  const range = document.createRange()
  let line = ''
  for (const { node, chars, lines } of texts) {
    const block = blockOf(node)
    const id = block ? (blocks.get(block) ?? blocks.size) : -1
    if (block) {
      blocks.set(block, id)
    }
    let offset = 0
    chars.forEach((char, index) => {
      const before = chars[index - 1] ?? ' '
      const opens =
        !SPACE.test(char) && (SPACE.test(before) || DASH.test(before))
      if (opens) {
        range.setStart(node, offset)
        range.setEnd(node, offset + char.length)
        line = `${id}:${Math.round(range.getBoundingClientRect().top)}`
      }
      lines[index] = line
      offset += char.length
    })
  }
}

// Wherever a word opens a new line in its block, a forced break takes the
// place of the space before it, or follows the dash before it, while the
// text is scrambled. A <br> already breaks the line, so the text after it
// starts afresh.
function markBreaks(texts: Array<ScrambledText>) {
  let previous = ''
  let space: CharMark | null = null
  let last: CharMark | null = null
  for (const text of texts) {
    if (text.node.previousSibling instanceof HTMLBRElement) {
      previous = ''
    }
    text.chars.forEach((char, index) => {
      if (SPACE.test(char)) {
        space = { text, index }
        return
      }
      const line = text.lines[index] ?? ''
      const sameBlock = line.split(':')[0] === previous.split(':')[0]
      if (previous && line !== previous && sameBlock) {
        if (space) {
          space.text.breaks.add(space.index)
        } else if (last && DASH.test(last.text.chars[last.index] ?? '')) {
          last.text.breaksAfter.add(last.index)
        }
      }
      previous = line
      space = null
      last = { text, index }
    })
  }
}

// Every glyph starts scrambled; the first settles at 30% of the run and the
// rest follow in reading order, so long and short texts finish together.
function settle({ index, length }: SettlePayload): number {
  return 0.3 + (0.7 * (index + 1)) / length
}

// A letter stays itself when no symbol keeps its line within bounds.
function render({ text, progress, drifts }: RenderPayload): string {
  const { chars, pools, lines, breaks, breaksAfter, size } = text
  return chars
    .map((char, index) => {
      if (breaks.has(index)) {
        return '\n'
      }
      if (breaksAfter.has(index)) {
        return `${char}\n`
      }
      if (SPACE.test(char)) {
        return ' '
      }
      const line = lines[index] ?? ''
      const state = drifts.get(line) ?? { drift: 0, count: 0 }
      drifts.set(line, state)
      if (progress >= settle({ index, length: chars.length })) {
        return char
      }
      const upper = -Math.min(KERNING, 0.01 * state.count) * size
      const fits = (pools[index] ?? []).filter(({ delta }) => {
        const drift = state.drift + delta
        return drift <= upper && drift >= -WINDOW * size
      })
      const standIn = fits[Math.floor(Math.random() * fits.length)]
      if (!standIn) {
        return char
      }
      state.drift += standIn.delta
      state.count += 1
      return standIn.glyph
    })
    .join('')
}

// Texts are written in reading order with one record per line, so texts
// sharing a line share its bounds. A text Vue rewrote is left to Vue.
function write({ texts, progress }: WritePayload) {
  const drifts = new Map<string, LineDrift>()
  for (const text of texts) {
    if (text.node.nodeValue !== text.written) {
      continue
    }
    text.written =
      progress >= 1 ? text.chars.join('') : render({ text, progress, drifts })
    text.node.nodeValue = text.written
  }
}

function prepare(roots: Array<Element>): Array<ScrambledText> {
  const cache = new Map<string, Map<string, Array<StandIn>>>()
  const texts = roots.flatMap((root) => {
    const size = parseFloat(getComputedStyle(root).fontSize)
    return textNodes(root).map((node) => {
      const weight = getComputedStyle(node.parentElement ?? root).fontWeight
      const byChar =
        cache.get(weight) ??
        pools({
          widths: advances({ root, weight }),
          tolerance: TOLERANCE * size,
        })
      cache.set(weight, byChar)
      const chars = [...(node.nodeValue ?? '')]
      return {
        node,
        chars,
        pools: chars.map((char) => byChar.get(char) ?? []),
        lines: chars.map(() => ''),
        breaks: new Set<number>(),
        breaksAfter: new Set<number>(),
        size,
        written: node.nodeValue ?? '',
      }
    })
  })
  measureLines(texts)
  markBreaks(texts)
  return texts
}

// One glyph repeated along a line, scrambled and settled like the text. Any
// symbol may stand in, as the caller holds each glyph’s place.
export function scrambleRepeat({
  char,
  count,
  progress,
}: RepeatPayload): Array<string> {
  return Array.from({ length: count }, (_, index) =>
    progress >= settle({ index, length: count })
      ? char
      : (SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] ?? char)
  )
}

// Scrambles the text under each root at once, then settles it over the
// duration. While it runs the roots are busy, which sets them to break lines
// only where the forced breaks are, so no line can rewrap. Each write is
// reported, so text it leaves to Vue, such as the rules, can keep step.
export function scramble({
  roots,
  duration,
  onProgress,
}: ScramblePayload): Promise<void> {
  const texts = prepare(roots)
  write({ texts, progress: 0 })
  onProgress?.(0)
  roots.forEach((root) => root.setAttribute('aria-busy', 'true'))

  return new Promise((resolve) => {
    const start = performance.now()
    let changed = start

    function frame(now: number) {
      const progress = Math.min(1, (now - start) / duration)
      if (progress >= 1 || now - changed >= INTERVAL) {
        changed = now
        write({ texts, progress })
        onProgress?.(progress)
      }
      if (progress < 1) {
        requestAnimationFrame(frame)
        return
      }
      roots.forEach((root) => root.removeAttribute('aria-busy'))
      resolve()
    }

    requestAnimationFrame(frame)
  })
}
