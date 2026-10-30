interface Matrix {
  dots: number
  size: number
  // Device pixels to a CSS pixel.
  scale: number
}

interface TilePayload extends Matrix {
  symbol: string
}

interface GridPayload extends Matrix {
  // The colour of an unlit dot.
  inactive: string
}

interface Geometry {
  gap: number
  dot: number
}

type Channels = [red: number, green: number, blue: number]

// The glyph is drawn large once and cropped to its ink, then drawn again
// onto a canvas with this many pixels a dot and read off.
const GLYPH = 128
const CELL = 6

// How much of a dot the emoji has to cover to light it, and how much of the
// matrix the glyph fills.
const THRESHOLD = 0.35
const FIT = 0.9

// An unlit dot shows this much of its colour.
const DIM = 0.35

const FONT =
  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'

function createContext(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas.getContext('2d', { willReadFrequently: true })
}

// The geometry MagicDotMatrix draws: dots three times as wide as the gaps
// between them.
function geometry({ dots, size }: Matrix): Geometry {
  const gap = size / (4 * dots - 1)
  return { gap, dot: (size - (dots - 1) * gap) / dots }
}

function fillDot(
  context: CanvasRenderingContext2D,
  index: number,
  dots: number,
  { gap, dot }: Geometry
) {
  const x = (index % dots) * (dot + gap) + dot / 2
  const y = Math.floor(index / dots) * (dot + gap) + dot / 2
  context.beginPath()
  context.arc(x, y, dot / 2, 0, Math.PI * 2)
  context.fill()
}

// The glyph, cropped to the pixels it inks.
function drawGlyph(symbol: string): HTMLCanvasElement | undefined {
  const context = createContext(GLYPH, GLYPH)
  if (!context) {
    return undefined
  }
  context.font = `${GLYPH * 0.7}px ${FONT}`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(symbol, GLYPH / 2, GLYPH / 2)

  const { data } = context.getImageData(0, 0, GLYPH, GLYPH)
  let left = GLYPH
  let top = GLYPH
  let right = -1
  let bottom = -1
  for (let y = 0; y < GLYPH; y++) {
    for (let x = 0; x < GLYPH; x++) {
      if ((data[(y * GLYPH + x) * 4 + 3] ?? 0) > 0) {
        left = Math.min(left, x)
        right = Math.max(right, x)
        top = Math.min(top, y)
        bottom = Math.max(bottom, y)
      }
    }
  }
  if (right < 0) {
    return undefined
  }

  const width = right - left + 1
  const height = bottom - top + 1
  const cropped = createContext(width, height)
  if (!cropped) {
    return undefined
  }
  cropped.drawImage(
    context.canvas,
    left,
    top,
    width,
    height,
    0,
    0,
    width,
    height
  )
  return cropped.canvas
}

// The colour of each dot the emoji covers, by dot index.
function sample(symbol: string, dots: number): Map<number, Channels> {
  const colors = new Map<number, Channels>()
  const glyph = drawGlyph(symbol)
  const side = dots * CELL
  const context = createContext(side, side)
  if (!glyph || !context) {
    return colors
  }

  const scale = (FIT * side) / Math.max(glyph.width, glyph.height)
  const width = glyph.width * scale
  const height = glyph.height * scale
  context.drawImage(
    glyph,
    (side - width) / 2,
    (side - height) / 2,
    width,
    height
  )

  const { data } = context.getImageData(0, 0, side, side)
  for (let dot = 0; dot < dots * dots; dot++) {
    const left = (dot % dots) * CELL
    const top = Math.floor(dot / dots) * CELL
    const total: Channels = [0, 0, 0]
    let alpha = 0
    for (let y = top; y < top + CELL; y++) {
      for (let x = left; x < left + CELL; x++) {
        const offset = (y * side + x) * 4
        const weight = data[offset + 3] ?? 0
        alpha += weight
        total[0] += (data[offset] ?? 0) * weight
        total[1] += (data[offset + 1] ?? 0) * weight
        total[2] += (data[offset + 2] ?? 0) * weight
      }
    }
    if (alpha / (CELL * CELL * 255) >= THRESHOLD) {
      colors.set(dot, [total[0] / alpha, total[1] / alpha, total[2] / alpha])
    }
  }
  return colors
}

// A code point no font has draws as a box. Each emoji is drawn small beside
// that box, and one that draws the same box is left out.
const PROBE = 16
const MISSING = String.fromCodePoint(0x1fffe)

export function drawable(symbols: Array<string>): Array<string> {
  const context = createContext(PROBE, PROBE)
  if (!context) {
    return symbols
  }
  context.font = `${PROBE * 0.75}px ${FONT}`
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  function pixels(symbol: string): Uint8ClampedArray {
    context?.clearRect(0, 0, PROBE, PROBE)
    context?.fillText(symbol, PROBE / 2, PROBE / 2)
    return (
      context?.getImageData(0, 0, PROBE, PROBE).data ?? new Uint8ClampedArray()
    )
  }

  const box = pixels(MISSING)
  return symbols.filter((symbol) =>
    pixels(symbol).some((value, index) => value !== box[index])
  )
}

// The unlit dots of a matrix, drawn once for every cell to share.
export function drawGrid({
  dots,
  size,
  scale,
  inactive,
}: GridPayload): HTMLCanvasElement | undefined {
  const context = createContext(size * scale, size * scale)
  if (!context) {
    return undefined
  }
  const shape = geometry({ dots, size, scale })
  context.scale(scale, scale)
  context.globalAlpha = DIM
  context.fillStyle = inactive
  for (let index = 0; index < dots * dots; index++) {
    fillDot(context, index, dots, shape)
  }
  return context.canvas
}

// The lit dots of one emoji, each in the colour it covers the dot with, on
// a clear ground, so the tile sits on the grid in any colour mode.
export function drawTile({
  symbol,
  dots,
  size,
  scale,
}: TilePayload): HTMLCanvasElement | undefined {
  const context = createContext(size * scale, size * scale)
  if (!context) {
    return undefined
  }
  const shape = geometry({ dots, size, scale })
  context.scale(scale, scale)
  for (const [index, [red, green, blue]] of sample(symbol, dots)) {
    context.fillStyle = `rgb(${Math.round(red)} ${Math.round(green)} ${Math.round(blue)})`
    fillDot(context, index, dots, shape)
  }
  return context.canvas
}
