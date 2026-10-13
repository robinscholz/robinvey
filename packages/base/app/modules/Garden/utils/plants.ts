import { slant } from './bed'
import type { GardenPen, GardenPoint, PlantPart } from './bed'
import type { GardenRandom } from './random'

export interface PlantPayload {
  pen: GardenPen
  random: GardenRandom
  x: number
  base: number
  top: number
  size: number
}

interface StemPayload {
  pen: GardenPen
  random: GardenRandom
  from: GardenPoint
  to: GardenPoint
  sway: number
  width?: number
}

interface ThickStemPayload extends Omit<StemPayload, 'sway' | 'width'> {
  size: number
}

interface PetalPayload {
  pen: GardenPen
  middle: number
  half: number
  from: number
  to: number
  char: string
  part: PlantPart
}

interface OutlinePayload {
  left: number
  right: number
  col: number
  widening: boolean
}

interface LeavesPayload {
  pen: GardenPen
  random: GardenRandom
  cells: Array<GardenPoint>
  art: LeafArt
  every: number
}

interface LeafArt {
  art: ReadonlyArray<string>
  key: ReadonlyArray<string>
}

interface DiscPayload {
  pen: GardenPen
  centre: GardenPoint
  radius: number
  paint: (cell: DiscCell) => DiscPaint | null
}

interface DiscCell {
  dx: number
  dy: number
  distance: number
}

interface DiscPaint {
  char: string
  part: PlantPart
}

const MIRROR: Record<string, string> = {
  '/': '\\',
  '\\': '/',
  '(': ')',
  ')': '(',
  '<': '>',
  '>': '<',
  '[': ']',
  ']': '[',
}

// Drawn for the right of a stem and mirrored for the left; the stem is the
// column before the first.
const LEAVES = {
  sprig: { art: ['/'], key: ['l'] },
  diamond: { art: ['<>'], key: ['ll'] },
  blade: { art: [' _', '/_)'], key: [' l', 'lll'] },
  frond: { art: ['  ,', '_/'], key: ['  l', 'll'] },
} satisfies Record<string, LeafArt>

const DAISIES = [
  {
    art: ['   _   ', ' _(_)_ ', '(_)@(_)', '  (_)  '],
    key: ['   b   ', ' bbbbb ', 'bbbebbb', '  bbb  '],
  },
  {
    art: [' .-. ', '(-@-)', " '-' "],
    key: [' bbb ', 'bbebb', ' bbb '],
  },
  {
    art: [' o ', 'o@o', ' o '],
    key: [' b ', 'beb', ' b '],
  },
  {
    art: ['\\|/', '-@-', '/|\\'],
    key: ['bbb', 'beb', 'bbb'],
  },
] satisfies Array<LeafArt>

const GROUND = [',', '.', "'", '`', ',', '.', '\\', '/', '|', '"']

function mirror(art: LeafArt): LeafArt {
  return {
    art: art.art.map((line) =>
      [...line]
        .reverse()
        .map((char) => MIRROR[char] ?? char)
        .join('')
    ),
    key: art.key.map((line) => [...line].reverse().join('')),
  }
}

function stem({ pen, random, from, to, sway, width = 1 }: StemPayload) {
  const bend = random.range({ min: -sway, max: sway })
  const strokes = Array.from({ length: width }, (_, offset) =>
    pen.curve({
      points: [
        { x: from.x + offset, y: from.y },
        { x: (from.x + to.x) / 2 + bend + offset, y: (from.y + to.y) / 2 },
        { x: to.x + offset, y: to.y },
      ],
      part: 'stem',
    })
  )
  return strokes[0] ?? []
}

// Large plants stand on a doubled stem that sways with their size.
function thick({ pen, random, from, to, size }: ThickStemPayload) {
  return stem({
    pen,
    random,
    from,
    to,
    sway: size / 4,
    width: size >= 8 ? 2 : 1,
  })
}

function outline({ left, right, col, widening }: OutlinePayload): string {
  switch (true) {
    case left === right:
      return '^'
    case col === left:
      return widening ? '/' : '('
    default:
      return widening ? '\\' : ')'
  }
}

// A petal pointed at the top and full from halfway down, outlined in the
// strokes that follow its edge.
function petal({ pen, middle, half, from, to, char, part }: PetalPayload) {
  const rows = Math.max(1, Math.round(to - from))
  let previous = 0
  for (let row = 0; row <= rows; row++) {
    const grown = Math.min(1, (row / rows) * 1.8)
    const reach = Math.max(0, half * Math.sin((Math.PI / 2) * grown))
    const left = Math.round(middle - reach)
    const right = Math.round(middle + reach)
    const widening = reach - previous > 0.3
    previous = reach
    for (let col = left; col <= right; col++) {
      const edge = col === left || col === right
      pen.plot({
        x: col,
        y: from + row,
        char: edge ? outline({ left, right, col, widening }) : char,
        part,
      })
    }
  }
}

// Every few rows up a stem, alternating sides, clear of the ground and the
// bloom.
function leaves({ pen, random, cells, art, every }: LeavesPayload) {
  const left = mirror(art)
  const width = Math.max(...art.art.map((line) => line.length))
  const height = art.art.length
  let side = random.chance(0.5)
  for (const [index, cell] of cells.entries()) {
    if (index < 2 || index > cells.length - 4 || index % every) {
      continue
    }
    const leaf = side ? art : left
    pen.stamp({
      x: side ? cell.x + 1 : cell.x - width,
      y: cell.y - height + 1,
      art: leaf.art,
      key: leaf.key,
    })
    side = !side
  }
}

// Visits every cell within a radius, measured with the cell’s height so the
// disc is round on screen.
function disc({ pen, centre, radius, paint }: DiscPayload) {
  const reach = Math.ceil(radius / pen.aspect)
  for (let row = -reach; row <= reach; row++) {
    for (let col = -Math.ceil(radius); col <= Math.ceil(radius); col++) {
      const dy = row * pen.aspect
      const distance = Math.hypot(col, dy)
      if (distance > radius + 0.5) {
        continue
      }
      const cell = paint({ dx: col, dy, distance })
      if (cell) {
        pen.plot({ x: centre.x + col, y: centre.y + row, ...cell })
      }
    }
  }
}

function band(value: number): number {
  return ((Math.floor(value) % 2) + 2) % 2
}

// Rays in two colours around an eye. A nodding head shows its eye as a dome
// and hangs its rays below.
export function sunburst({ pen, random, x, base, top, size }: PlantPayload) {
  const nodding = random.chance(0.4)
  const centre = {
    x: Math.round(x + random.range({ min: -size / 3, max: size / 3 })),
    y: Math.round(top + (nodding ? size * 0.4 : size) / pen.aspect),
  }
  const cells = thick({ pen, random, from: { x, y: base }, to: centre, size })
  leaves({ pen, random, cells, art: LEAVES.sprig, every: 5 })
  const rays = Math.max(12, Math.round(size * 1.4))
  const tips = Array.from(
    { length: rays },
    () => size * random.range({ min: 0.86, max: 1 })
  )
  const eye = Math.max(1.5, size * 0.32)
  disc({
    pen,
    centre,
    radius: size,
    paint({ dx, dy, distance }) {
      if (distance <= eye && (!nodding || dy <= 0)) {
        return { char: distance < eye - 1.2 ? '@' : 'o', part: 'eye' }
      }
      if (nodding && dy < 0) {
        return null
      }
      const sector = ((Math.atan2(dy, dx) / (2 * Math.PI) + 1) % 1) * rays
      const index = Math.floor(sector)
      const offset = sector - index
      const tip = tips[index] ?? size
      if (distance > tip || offset < 0.1 || offset > 0.9) {
        return null
      }
      return {
        char: distance > tip - 1 ? 'o' : slant({ dx, dy, flat: '-' }),
        part: index % 2 ? 'stripe' : 'bloom',
      }
    },
  })
}

// A tilted bowl swirled with two colours, its throat set off centre.
export function spiral({ pen, random, x, base, top, size }: PlantPayload) {
  const width = size
  const height = size * random.range({ min: 0.8, max: 0.95 })
  const tilt = random.range({ min: -0.4, max: 0.4 })
  const centre = {
    x: Math.round(x + random.range({ min: -size / 2, max: size / 2 })),
    y: Math.round(top + width / pen.aspect),
  }
  const cells = thick({ pen, random, from: { x, y: base }, to: centre, size })
  leaves({ pen, random, cells, art: LEAVES.blade, every: 6 })
  const stripes = random.int({ min: 3, max: 4 }) * 2
  const twist =
    random.range({ min: 1.2, max: 2 }) * random.pick([-1, 1] as const)
  const throat = width * random.range({ min: -0.3, max: 0.3 })
  const cos = Math.cos(tilt)
  const sin = Math.sin(tilt)
  disc({
    pen,
    centre,
    radius: width,
    paint({ dx, dy }) {
      const u = dx * cos + dy * sin
      const v = -dx * sin + dy * cos
      const reach = Math.hypot(u / width, v / height)
      if (reach > 1) {
        return null
      }
      const throatReach = Math.hypot(
        (u - throat) / (width * 0.22),
        v / (height * 0.32)
      )
      if (throatReach <= 1) {
        return { char: throatReach < 0.5 ? '@' : 'O', part: 'eye' }
      }
      const turn = (Math.atan2(v, u) / (2 * Math.PI)) * stripes
      return band(turn + reach * twist)
        ? { char: '+', part: 'stripe' }
        : { char: '#', part: 'bloom' }
    },
  })
}

// Two pointed petals in front of a third, closing into a cup, on a thorny
// stem.
export function tulip({ pen, random, x, base, top, size }: PlantPayload) {
  const half = Math.max(3, Math.round(size * 0.8))
  const height = Math.max(
    5,
    Math.round(
      (half * 2.4 * random.range({ min: 0.9, max: 1.15 })) / pen.aspect
    )
  )
  const centre = Math.round(x + random.range({ min: -1, max: 1 }))
  const bottom = top + height
  const cells = thick({
    pen,
    random,
    from: { x, y: base },
    to: { x: centre, y: bottom },
    size,
  })
  for (const [index, cell] of cells.entries()) {
    if (index > 1 && index < cells.length - 2 && index % 3 === 0) {
      const side = index % 2 ? 1 : -1
      pen.plot({
        x: cell.x + (side > 0 ? 2 : -1),
        y: cell.y,
        char: side > 0 ? '>' : '<',
        part: 'stem',
      })
    }
  }
  petal({
    pen,
    middle: centre,
    half: half * 0.55,
    from: top,
    to: bottom - height * 0.25,
    char: '%',
    part: 'stripe',
  })
  for (const side of [-1, 1]) {
    petal({
      pen,
      middle: centre + side * half * 0.42,
      half: half * 0.6,
      from: top + Math.round(height * 0.22),
      to: bottom - height * 0.2,
      char: '#',
      part: 'bloom',
    })
  }
  const cup = Math.max(2, Math.round(height * 0.35))
  for (let row = 0; row < cup; row++) {
    const fall = (row + 1) / cup
    const reach = Math.round(half * Math.sqrt(Math.max(0, 1 - fall ** 2)))
    for (let col = -reach; col <= reach; col++) {
      const edge = col === -reach || col === reach
      pen.plot({
        x: centre + col,
        y: bottom - cup + row,
        char: edge ? (col < 0 ? '\\' : '/') : '#',
        part: 'bloom',
      })
    }
  }
  pen.write({ x: centre - 1, y: bottom, text: '\\_/', part: 'leaf' })
}

// Florets in pairs up a spike, narrowing to a bud.
export function lupin({ pen, random, x, base, top, size }: PlantPayload) {
  const length = Math.max(
    4,
    Math.round((base - top) * random.range({ min: 0.4, max: 0.55 }))
  )
  const widest = Math.max(1, Math.round(size * 0.4))
  const cells = stem({
    pen,
    random,
    from: { x, y: base },
    to: { x, y: top + length },
    sway: 1,
  })
  leaves({ pen, random, cells, art: LEAVES.diamond, every: 3 })
  for (let index = 0; index < length; index++) {
    const y = top + length - 1 - index
    const inner = Math.round(widest * (1 - index / length) ** 0.8)
    if (inner === 0) {
      pen.plot({ x, y, char: index === length - 1 ? '.' : 'o', part: 'bloom' })
      continue
    }
    const floret = `(${'@'.repeat(inner)})`
    pen.write({ x: x - floret.length, y, text: floret, part: 'bloom' })
    pen.write({ x: x + 1, y, text: floret, part: 'bloom' })
    pen.plot({ x, y, char: '#', part: 'eye' })
    for (let offset = 1; offset <= inner; offset++) {
      if ((offset + index) % 2) {
        pen.plot({ x: x - 1 - offset, y, char: '@', part: 'stripe' })
        pen.plot({ x: x + 1 + offset, y, char: '@', part: 'stripe' })
      }
    }
  }
}

// A clock of seeds on spokes, each spoke tipped with a seed.
export function puff({ pen, random, x, base, top, size }: PlantPayload) {
  const radius = size * random.range({ min: 0.65, max: 0.9 })
  const centre = {
    x: Math.round(x + random.range({ min: -1, max: 1 })),
    y: Math.round(top + radius / pen.aspect),
  }
  const cells = stem({ pen, random, from: { x, y: base }, to: centre, sway: 1 })
  leaves({ pen, random, cells, art: LEAVES.frond, every: 5 })
  const spokes = Math.max(10, Math.round(radius * 1.2))
  const start = random.range({ min: 0, max: Math.PI })
  for (let spoke = 0; spoke < spokes; spoke++) {
    const angle =
      start +
      (2 * Math.PI * spoke) / spokes +
      random.range({ min: -0.08, max: 0.08 })
    const length = radius * random.range({ min: 0.75, max: 1 })
    const dx = Math.cos(angle)
    const dy = Math.sin(angle)
    const char = slant({ dx, dy, flat: '-' })
    for (let reach = radius * 0.3; reach < length - 1; reach += 0.5) {
      pen.plot({
        x: centre.x + dx * reach,
        y: centre.y + (dy * reach) / pen.aspect,
        char,
        part: 'stripe',
      })
    }
    pen.plot({
      x: centre.x + dx * length,
      y: centre.y + (dy * length) / pen.aspect,
      char: random.pick(['*', '*', 'o', '+']),
      part: 'bloom',
    })
  }
  pen.write({ x: centre.x - 1, y: centre.y, text: '(@)', part: 'eye' })
}

// Broad pointed petals around an eye, each with a vein down its middle.
export function star({ pen, random, x, base, top, size }: PlantPayload) {
  const centre = {
    x: Math.round(x + random.range({ min: -size / 3, max: size / 3 })),
    y: Math.round(top + size / pen.aspect),
  }
  const cells = thick({ pen, random, from: { x, y: base }, to: centre, size })
  leaves({ pen, random, cells, art: LEAVES.blade, every: 6 })
  const petals = random.int({ min: 5, max: 7 })
  const sector = (2 * Math.PI) / petals
  const turn = random.range({ min: 0, max: sector })
  const eye = Math.max(1.5, size * 0.2)
  disc({
    pen,
    centre,
    radius: size,
    paint({ dx, dy, distance }) {
      if (distance <= eye) {
        return { char: distance < eye - 1 ? '@' : 'o', part: 'eye' }
      }
      const angle = Math.atan2(dy, dx) - turn
      const offset =
        ((((angle % sector) + sector) % sector) - sector / 2) / (sector / 2)
      const reach = distance / size
      const width = 0.9 * Math.sin(Math.PI * Math.min(1, reach)) ** 0.7
      if (Math.abs(offset) > width) {
        return null
      }
      return Math.abs(offset) < width * 0.22
        ? { char: slant({ dx, dy, flat: '-' }), part: 'stripe' }
        : { char: '#', part: 'bloom' }
    },
  })
}

// A flat seed head pocked with holes, over a stepped cone.
export function pod({ pen, random, x, base, top, size }: PlantPayload) {
  const half = Math.max(3, Math.round(size * 0.75))
  const cap = Math.max(2, Math.round((half * 0.8) / pen.aspect))
  const steps = Math.max(
    2,
    Math.round(cap * random.range({ min: 1, max: 1.6 }))
  )
  const neck = top + cap + steps
  stem({
    pen,
    random,
    from: { x, y: base },
    to: { x, y: neck },
    sway: 0,
    width: 2,
  })
  for (let row = 0; row < cap; row++) {
    const fall = (row + 0.5) / cap
    const reach = Math.round(half * Math.sqrt(1 - (2 * fall - 1) ** 2) + 0.4)
    for (let col = -reach; col <= reach + 1; col++) {
      const edge = col === -reach || col === reach + 1
      const hole = !edge && (col + 2 * (row % 2) + 64) % 4 === 0
      pen.plot({
        x: x + col,
        y: top + row,
        char: edge ? (col < 0 ? '(' : ')') : hole ? 'O' : '@',
        part: hole ? 'eye' : 'bloom',
      })
    }
  }
  for (let step = 0; step < steps; step++) {
    const inset = Math.round(((half - 1) * (step + 1)) / (steps + 1))
    const width = 2 * (half - inset)
    pen.write({
      x: x - (half - inset),
      y: top + cap + step,
      text: `\\${'='.repeat(Math.max(0, width - 1))}/`,
      part: 'stripe',
    })
  }
}

// One small head on a wandering stem.
export function daisy({ pen, random, x, base, top, size }: PlantPayload) {
  const sprite = random.pick(size > 4 ? DAISIES : DAISIES.slice(1))
  const width = sprite.art[0]?.length ?? 1
  const head = {
    x: Math.round(x + random.range({ min: -size, max: size })),
    y: top,
  }
  const middle = Math.floor(sprite.art.length / 2)
  const cells = stem({
    pen,
    random,
    from: { x, y: base },
    to: { x: head.x, y: head.y + middle },
    sway: size,
  })
  leaves({ pen, random, cells, art: LEAVES.sprig, every: 6 })
  pen.stamp({
    x: head.x - Math.floor(width / 2),
    y: head.y,
    art: sprite.art,
    key: sprite.key,
  })
}

// A narrow blade, ribbed down its middle.
export function spike({ pen, random, x, base, top, size }: PlantPayload) {
  const half = Math.max(1, size * random.range({ min: 0.2, max: 0.35 }))
  const height = Math.max(1, base - top)
  const lean = random.range({ min: -half, max: half })
  for (let row = 0; row <= height; row++) {
    const grown = row / height
    const middle = x + lean * (1 - grown)
    const reach = half * grown
    const from = Math.round(middle - reach)
    const to = Math.round(middle + reach)
    for (let col = from; col <= to; col++) {
      const char =
        from === to ? '|' : col === from ? '/' : col === to ? '\\' : '|'
      pen.plot({ x: col, y: top + row, char, part: 'bloom' })
    }
  }
}

// A curl of grass and the ground it grows from.
export function grass({ pen, random, x, base, top }: PlantPayload) {
  const lean = random.range({ min: -2, max: 2 })
  pen.curve({
    points: [
      { x, y: base },
      { x, y: (base + top) / 2 },
      { x: x + lean, y: top },
    ],
    part: 'bloom',
  })
}

export function ground({ pen, random, base }: PlantPayload) {
  for (let col = 0; col < pen.cols; col++) {
    if (random.chance(0.7)) {
      pen.plot({ x: col, y: base, char: random.pick(GROUND), part: 'bloom' })
    }
  }
}
