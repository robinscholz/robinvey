import type { PlantPart } from './bed'
import type { Garden, GardenPlant } from './grow'

export interface GardenFrame {
  cols: number
  rows: number
  chars: Array<string>
  hues: Uint8Array
  plants: Uint16Array
}

interface ComposePayload {
  garden: Garden
  leans: ArrayLike<number>
}

interface PlantPayload {
  plant: GardenPlant
  base: number
}

interface AlongPayload extends PlantPayload {
  row: number
}

interface ShiftPayload extends AlongPayload {
  sway: number
}

interface TurnPayload {
  char: string
  notch: number
}

const HEAD: ReadonlyArray<PlantPart> = ['bloom', 'stripe', 'eye']

// A stroke leaning right turns a notch clockwise, one leaning left a notch
// back. Strokes already at an angle hold it, so a stem never turns flat.
const CLOCKWISE: Record<string, string> = { '|': '/', '\\': '|' }
const COUNTERCLOCKWISE: Record<string, string> = { '|': '\\', '/': '|' }

// A stalk bends most near its top.
const BEND = 1.6

// A blade leaning further than this tips its strokes over.
const TIP = 0.55

// How far up its height a row is, from 0 at the ground to 1 at the crown.
function along({ plant, base, row }: AlongPayload): number {
  const height = Math.max(1, base - plant.crown)
  return Math.min(1, Math.max(0, (base - row) / height))
}

function shiftAt({ plant, base, sway, row }: ShiftPayload): number {
  return Math.round(sway * along({ plant, base, row }) ** BEND)
}

// How many columns a plant’s crown travels at full lean. Taller plants
// travel further; blades bend more for their height than stems do.
function amplitude({ plant, base }: PlantPayload): number {
  const height = Math.max(1, base - plant.crown)
  switch (plant.kind) {
    case 'ground':
      return 0
    case 'blade':
      return Math.min(3, Math.max(1, height * 0.35))
    default:
      return Math.min(5, Math.max(1, height * 0.12))
  }
}

function turn({ char, notch }: TurnPayload): string {
  switch (true) {
    case notch > 0:
      return CLOCKWISE[char] ?? char
    case notch < 0:
      return COUNTERCLOCKWISE[char] ?? char
    default:
      return char
  }
}

// Lays every plant into one grid at its current lean, back to front. A
// flower’s head moves whole with the top of its stem; the stem bends below
// it, and turns its strokes wherever a row steps sideways from the next.
export function compose({ garden, leans }: ComposePayload): GardenFrame {
  const { cols, rows, plants } = garden
  const size = cols * rows
  const base = rows - 1
  const frame: GardenFrame = {
    cols,
    rows,
    chars: Array.from({ length: size }, () => ' '),
    hues: new Uint8Array(size),
    plants: new Uint16Array(size),
  }
  for (const [position, plant] of plants.entries()) {
    const lean = leans[position] ?? 0
    const sway = lean * amplitude({ plant, base })
    for (const cell of plant.cells) {
      let shift = 0
      let char = cell.char
      switch (true) {
        case plant.kind === 'ground':
          break
        case plant.kind === 'flower' && HEAD.includes(cell.part):
          shift = Math.round(sway)
          break
        default: {
          shift = shiftAt({ plant, base, sway, row: cell.y })
          const step = shiftAt({ plant, base, sway, row: cell.y - 1 }) - shift
          const tilt = lean * along({ plant, base, row: cell.y })
          const tipped = plant.kind === 'blade' && Math.abs(tilt) > TIP
          const notch = step || (tipped ? Math.sign(tilt) : 0)
          if (cell.part === 'stem' || plant.kind === 'blade') {
            char = turn({ char, notch })
          }
        }
      }
      const x = cell.x + shift
      if (x < 0 || x >= cols) {
        continue
      }
      const index = cell.y * cols + x
      frame.chars[index] = char
      frame.hues[index] = plant.hues[cell.part]
      frame.plants[index] = position + 1
    }
  }
  return frame
}
