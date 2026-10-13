// A cell stores the part it belongs to rather than a hue, so a plant can be
// repainted without being drawn again.
export const PlantParts = ['bloom', 'stripe', 'eye', 'stem', 'leaf'] as const

export type PlantPart = (typeof PlantParts)[number]

export interface GardenPoint {
  x: number
  y: number
}

export interface PlantCell extends GardenPoint {
  char: string
  part: PlantPart
}

interface CreatePenPayload {
  cols: number
  rows: number
  aspect: number
}

interface WritePayload extends GardenPoint {
  text: string
  part: PlantPart
}

interface StampPayload extends GardenPoint {
  art: ReadonlyArray<string>
  key: ReadonlyArray<string>
}

interface CurvePayload {
  points: [GardenPoint, GardenPoint, GardenPoint]
  part: PlantPart
  flat?: string
}

interface SlantPayload {
  dx: number
  dy: number
  flat?: string
}

const STAMP_KEY: Record<string, PlantPart> = {
  b: 'bloom',
  s: 'stripe',
  e: 'eye',
  t: 'stem',
  l: 'leaf',
}

// The stroke that follows a direction, measured with the cell’s height, so a
// diagonal leans at the angle it is drawn rather than the grid’s.
export function slant({ dx, dy, flat = '_' }: SlantPayload): string {
  const angle = ((Math.atan2(-dy, dx) * 180) / Math.PI + 180) % 180
  switch (true) {
    case angle < 22.5 || angle >= 157.5:
      return flat
    case angle < 67.5:
      return '/'
    case angle < 112.5:
      return '|'
    default:
      return '\\'
  }
}

// Plants keep this many columns beyond either side of the bed, so the wind
// can blow them into view rather than leave a gap.
const OVERHANG = 8

// One plant’s cells, the last glyph drawn at a cell covering the one before.
export function createPen({ cols, rows, aspect }: CreatePenPayload) {
  const drawn = new Map<string, PlantCell>()

  function plot({ x, y, char, part }: PlantCell) {
    const col = Math.round(x)
    const row = Math.round(y)
    if (
      char === ' ' ||
      row < 0 ||
      row >= rows ||
      col < -OVERHANG ||
      col >= cols + OVERHANG
    ) {
      return
    }
    drawn.set(`${col}:${row}`, { x: col, y: row, char, part })
  }

  function cells(): Array<PlantCell> {
    return [...drawn.values()]
  }

  function write({ x, y, text, part }: WritePayload) {
    for (const [offset, char] of [...text].entries()) {
      plot({ x: x + offset, y, char, part })
    }
  }

  // Art drawn line by line, with a key of the same shape naming each glyph’s
  // part by its initial. Spaces leave what is underneath.
  function stamp({ x, y, art, key }: StampPayload) {
    for (const [row, line] of art.entries()) {
      for (const [col, char] of [...line].entries()) {
        const part = STAMP_KEY[key[row]?.[col] ?? '']
        if (part) {
          plot({ x: x + col, y: y + row, char, part })
        }
      }
    }
  }

  // A quadratic curve, one glyph per cell it crosses, each glyph following
  // the curve’s direction there. Returns the cells, bottom first for a stem.
  function curve({ points, part, flat }: CurvePayload): Array<GardenPoint> {
    const [start, control, end] = points
    const length =
      Math.hypot(control.x - start.x, (control.y - start.y) * aspect) +
      Math.hypot(end.x - control.x, (end.y - control.y) * aspect)
    const steps = Math.max(2, Math.ceil(length * 4))
    const cells: Array<GardenPoint> = []
    let last = ''
    for (let step = 0; step <= steps; step++) {
      const t = step / steps
      const x =
        (1 - t) ** 2 * start.x + 2 * (1 - t) * t * control.x + t ** 2 * end.x
      const y =
        (1 - t) ** 2 * start.y + 2 * (1 - t) * t * control.y + t ** 2 * end.y
      const cell = `${Math.round(x)}:${Math.round(y)}`
      if (cell === last) {
        continue
      }
      last = cell
      const dx =
        2 * (1 - t) * (control.x - start.x) + 2 * t * (end.x - control.x)
      const dy =
        (2 * (1 - t) * (control.y - start.y) + 2 * t * (end.y - control.y)) *
        aspect
      plot({ x, y, char: slant({ dx, dy, flat }), part })
      cells.push({ x: Math.round(x), y: Math.round(y) })
    }
    return cells
  }

  return {
    cols,
    rows,
    aspect,
    plot,
    write,
    stamp,
    curve,
    cells,
  }
}

export type GardenPen = ReturnType<typeof createPen>
