// A frame is a list of layers. Each layer lists the dots it lights, counted
// row by row from the top left, and a later layer paints over an earlier
// one.
type Layer = Array<number>
type Frame = Array<Layer>

interface Point {
  col: number
  row: number
}

// A dot per character: 48 columns in 48ch.
export const PANEL = { cols: 48, rows: 16, interval: 120 }

// The cable runs from the valley station, low on the left, up to the
// mountain station, and sags a row in the middle.
const VALLEY: Point = { col: 3, row: 10 }
const SUMMIT: Point = { col: 44, row: 2 }
const SAG = 1

// The cabins hang three columns in from the pylons and wait there a while
// before they set off, one up and one down, passing halfway.
const CLEARANCE = 3
const DWELL = 8

// The ground follows the cable a few rows under it, with a ridge of its
// own, and falls off the bottom of the panel towards the valley.
const DEPTH = 5

function dot({ col, row }: Point): number | undefined {
  if (col < 0 || row < 0 || col >= PANEL.cols || row >= PANEL.rows) {
    return undefined
  }
  return row * PANEL.cols + col
}

function layer(points: Array<Point>): Layer {
  return points.map(dot).filter((index): index is number => index !== undefined)
}

function range(from: number, to: number): Array<number> {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index)
}

function cableRow(col: number): number {
  const progress = (col - VALLEY.col) / (SUMMIT.col - VALLEY.col)
  const rise = (SUMMIT.row - VALLEY.row) * progress
  const sag = SAG * 4 * progress * (1 - progress)
  return Math.round(VALLEY.row + rise + sag)
}

function groundRow(col: number): number {
  const under = Math.min(Math.max(col, VALLEY.col), SUMMIT.col)
  const ridge = Math.round(Math.sin(col * 0.9) * Math.cos(col * 0.35))
  return cableRow(under) + DEPTH + ridge
}

function ground(): Layer {
  return layer(
    range(0, PANEL.cols - 1).flatMap((col) =>
      range(groundRow(col), PANEL.rows - 1).map((row) => ({ col, row }))
    )
  )
}

function pylon({ col, row }: Point): Array<Point> {
  return [
    { col: col - 1, row },
    { col: col + 1, row },
    ...range(row + 1, groundRow(col) - 1).map((below) => ({ col, row: below })),
  ]
}

function structure(): Layer {
  const cable = range(VALLEY.col, SUMMIT.col).map((col) => ({
    col,
    row: cableRow(col),
  }))
  return layer([...cable, ...pylon(VALLEY), ...pylon(SUMMIT)])
}

// A hanger under the cable and a cabin with a window, three dots square.
function cabin(col: number): Array<Point> {
  const row = cableRow(col)
  return [
    { col, row: row + 1 },
    { col: col - 1, row: row + 2 },
    { col, row: row + 2 },
    { col: col + 1, row: row + 2 },
    { col: col - 1, row: row + 3 },
    { col: col + 1, row: row + 3 },
    { col: col - 1, row: row + 4 },
    { col, row: row + 4 },
    { col: col + 1, row: row + 4 },
  ]
}

// One crossing: the cabins wait, then swap stations. The loop takes over
// where the next wait would be, as the cabins are alike.
export function createCableway(): Array<Frame> {
  const start = VALLEY.col + CLEARANCE
  const end = SUMMIT.col - CLEARANCE
  const steps = [
    ...Array.from({ length: DWELL }, () => 0),
    ...range(1, end - start - 1),
  ]
  const terrain = ground()
  const cableway = structure()
  return steps.map((step) => [
    terrain,
    cableway,
    layer([...cabin(start + step), ...cabin(end - step)]),
  ])
}
