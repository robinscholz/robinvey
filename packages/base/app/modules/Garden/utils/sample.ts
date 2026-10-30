export interface EmojiSample {
  // The dots each colour lights, in the order of the colours.
  layers: Array<Array<number>>
  colors: Array<string>
}

interface SamplePayload {
  symbol: string
  dots: number
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

// Colours are rounded to this many levels a channel, so a shaded area
// becomes one layer.
const LEVELS = 6

const FONT =
  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'

function createContext(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas.getContext('2d', { willReadFrequently: true })
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

function level(channel: number): number {
  const step = 255 / (LEVELS - 1)
  return Math.round(Math.round(channel / step) * step)
}

function toColor([red, green, blue]: Channels): string {
  return `rgb(${level(red)} ${level(green)} ${level(blue)})`
}

// One still of the emoji on the matrix, a layer for each colour it has.
// Nothing for an emoji the system has no glyph for.
export function sampleEmoji({
  symbol,
  dots,
}: SamplePayload): EmojiSample | undefined {
  const glyph = drawGlyph(symbol)
  const side = dots * CELL
  const context = createContext(side, side)
  if (!glyph || !context) {
    return undefined
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
  const buckets = new Map<string, Array<number>>()

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
    if (alpha / (CELL * CELL * 255) < THRESHOLD) {
      continue
    }
    const color = toColor([
      total[0] / alpha,
      total[1] / alpha,
      total[2] / alpha,
    ])
    const layer = buckets.get(color)
    if (layer) {
      layer.push(dot)
    } else {
      buckets.set(color, [dot])
    }
  }

  if (buckets.size === 0) {
    return undefined
  }
  return { colors: [...buckets.keys()], layers: [...buckets.values()] }
}
