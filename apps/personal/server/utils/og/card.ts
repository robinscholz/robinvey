import tiles from './tiles.json'

interface Tile {
  symbol: string
  dots: Array<Array<number | string>>
}

interface Point {
  x: number
  y: number
}

interface TilePayload extends Point {
  tile: Tile
}

interface CirclePayload extends Point {
  fill: string
  opacity: number
}

// The size link previews take.
export const OG_SIZE = { width: 1200, height: 630 }

// The site’s paper and subtle ink in sRGB, `app.color.surface.bg.base` and
// `fg.subtle` of the light mode, which the renderer takes no oklch() for.
// An unlit dot shows the subtle ink at the canvas’s own dimness.
const PAPER = '#f2f2f0'
const SUBTLE = '#bdbcb6'
const DIM = 0.35

// Tiles as on the canvas, larger: twelve dots a side, 80px square, one every
// 120px, ten to a row and five rows, centred on the picture.
const DOTS = 12
const SIZE = 80
const PITCH = 120
const COLS = 10
const ROWS = 5

// The geometry MagicDotMatrix draws: round dots three times as wide as the
// gaps between them.
const GAP = SIZE / (4 * DOTS - 1)
const DOT = (SIZE - (DOTS - 1) * GAP) / DOTS

function round(value: number): string {
  return value.toFixed(2)
}

function circle({ x, y, fill, opacity }: CirclePayload): string {
  const alpha = opacity < 1 ? ` fill-opacity="${opacity}"` : ''
  return `<circle cx="${round(x)}" cy="${round(y)}" r="${round(DOT / 2)}" fill="${fill}"${alpha}/>`
}

// The dots an emoji lights, by index, in their colours.
function lit(tile: Tile): Map<number, string> {
  const map = new Map<number, string>()
  for (const [index, color] of tile.dots) {
    if (typeof index === 'number' && typeof color === 'string') {
      map.set(index, color)
    }
  }
  return map
}

function matrix({ tile, x, y }: TilePayload): string {
  const colors = lit(tile)
  return Array.from({ length: DOTS * DOTS }, (_, index) => {
    const color = colors.get(index)
    return circle({
      x: x + (index % DOTS) * (DOT + GAP) + DOT / 2,
      y: y + Math.floor(index / DOTS) * (DOT + GAP) + DOT / 2,
      fill: color ?? SUBTLE,
      opacity: color ? 1 : DIM,
    })
  }).join('')
}

// The canvas, tiled with the emoji the panel cycles through: each in turn
// along a row, and four on from one row to the next, so no two neighbours
// show the same.
export function ogCanvas(): string {
  const { width, height } = OG_SIZE
  const left = (width - COLS * PITCH + PITCH - SIZE) / 2
  const top = (height - ROWS * PITCH + PITCH - SIZE) / 2
  const cells: Array<string> = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = tiles[(col + row * 4) % tiles.length]
      if (tile) {
        cells.push(
          matrix({ tile, x: left + col * PITCH, y: top + row * PITCH })
        )
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${PAPER}"/>${cells.join('')}</svg>`
}
