import { createPen } from './bed'
import {
  daisy,
  grass,
  ground,
  lupin,
  pod,
  puff,
  spike,
  spiral,
  star,
  sunburst,
  tulip,
} from './plants'
import { createRandom } from './random'
import type { PlantCell, PlantPart } from './bed'
import type { PlantPayload } from './plants'
import type { GardenRandom } from './random'

export type PlantHues = Record<PlantPart, number>

// A flower sways on its stem and keeps its head whole, a blade bends along
// its length, and the ground stays put.
export type PlantKind = 'flower' | 'blade' | 'ground'

export interface GardenPlant {
  cells: Array<PlantCell>
  hues: PlantHues
  kind: PlantKind
  x: number
  crown: number
}

export interface Garden {
  cols: number
  rows: number
  plants: Array<GardenPlant>
}

interface GrowPayload {
  cols: number
  rows: number
  aspect: number
  seed: number
}

type Species = (payload: PlantPayload) => void

interface RowPayload {
  from: number
  gap: { min: number; max: number }
  plant: (x: number) => number
}

interface PaintPayload {
  random: GardenRandom
  previous: number
}

interface PlacementPayload {
  species: Species
  kind?: PlantKind
  x: number
  top: number
  size: number
  palette: PlantHues
}

// One per `app.color.hue.*` token, as the hover hues run.
const HUE_COUNT = 7
const GREEN = 4
const YELLOW = 3

// The centre that stands out against each petal colour.
const EYES: Record<number, number> = {
  1: 3,
  2: 1,
  3: 2,
  4: 2,
  5: 3,
  6: 3,
  7: 2,
}

const TALL: Array<Species> = [sunburst, spiral, lupin, puff, tulip, star, pod]
const SHORT: Array<Species> = [sunburst, tulip, puff, star, spiral]

function next(hue: number): number {
  return (hue % HUE_COUNT) + 1
}

// A petal colour and the stripe and eye that go with it.
function bloomHues(bloom: number): Pick<PlantHues, 'bloom' | 'stripe' | 'eye'> {
  return {
    bloom,
    stripe: next(bloom) === GREEN ? next(GREEN) : next(bloom),
    eye: EYES[bloom] ?? YELLOW,
  }
}

function paint({ random, previous }: PaintPayload): PlantHues {
  const blooms = [1, 2, 3, 5, 6, 7].filter((hue) => hue !== previous)
  return {
    ...bloomHues(random.pick(blooms)),
    stem: GREEN,
    leaf: random.chance(0.3) ? YELLOW : GREEN,
  }
}

function greenery(random: GardenRandom): PlantHues {
  const hue = random.chance(0.35) ? YELLOW : GREEN
  return { bloom: hue, stripe: hue, eye: hue, stem: hue, leaf: hue }
}

// Plants are drawn from the back, so each row overlaps the one behind it.
// Every plant scales with the smaller of the bed’s width and height.
export function grow({ cols, rows, aspect, seed }: GrowPayload): Garden {
  const random = createRandom(seed)
  const plants: Array<GardenPlant> = []
  const base = rows - 1
  const scale = Math.max(4, Math.min(cols / 5, (rows * aspect) / 6.5))

  // The crown is the highest row a plant bends to: the top of a flower’s
  // stem, under its head, or the tip of a blade.
  function plant({
    species,
    kind = 'flower',
    x,
    top,
    size,
    palette,
  }: PlacementPayload) {
    const pen = createPen({ cols, rows, aspect })
    species({ pen, random, x: Math.round(x), base, top: Math.round(top), size })
    const cells = pen.cells()
    const stems = cells.filter((cell) => cell.part === 'stem')
    const crown = (kind === 'flower' && stems.length ? stems : cells).reduce(
      (highest, cell) => Math.min(highest, cell.y),
      base
    )
    plants.push({ cells, hues: palette, kind, x: Math.round(x), crown })
  }

  function row({ from, gap, plant: place }: RowPayload) {
    let x = from
    while (x < cols + gap.max) {
      const width = place(x)
      x += width * random.range(gap)
    }
  }

  function bloom(): PlantHues {
    return paint({ random, previous: plants.at(-1)?.hues.bloom ?? 0 })
  }

  // Dealt from a shuffled deck, so every species shows before any repeats.
  function deck(species: Array<Species>) {
    let hand: Array<Species> = []
    return function deal(): Species {
      if (!hand.length) {
        hand = species
          .map((entry) => ({ entry, key: random.next() }))
          .sort((first, second) => first.key - second.key)
          .map(({ entry }) => entry)
      }
      return hand.pop() ?? sunburst
    }
  }

  const tall = deck(TALL)
  const short = deck(SHORT)

  row({
    from: random.range({ min: 0, max: scale }),
    gap: { min: 1.4, max: 1.9 },
    plant(x) {
      const size = scale * random.range({ min: 0.7, max: 1 })
      plant({
        species: tall(),
        x,
        top: rows * random.range({ min: 0.06, max: 0.32 }),
        size,
        palette: bloom(),
      })
      return size
    },
  })

  row({
    from: random.range({ min: scale / 2, max: scale * 1.5 }),
    gap: { min: 2.4, max: 3.4 },
    plant(x) {
      const size = scale * random.range({ min: 0.45, max: 0.7 })
      plant({
        species: short(),
        x,
        top: rows * random.range({ min: 0.35, max: 0.58 }),
        size,
        palette: bloom(),
      })
      return size
    },
  })

  row({
    from: random.range({ min: 0, max: scale }),
    gap: { min: 6, max: 10 },
    plant(x) {
      const size = scale * random.range({ min: 0.4, max: 0.7 })
      plant({
        species: spike,
        kind: 'blade',
        x,
        top: rows * random.range({ min: 0.55, max: 0.85 }),
        size,
        palette: greenery(random),
      })
      return size
    },
  })

  row({
    from: random.range({ min: 0, max: 6 }),
    gap: { min: 1.6, max: 3 },
    plant(x) {
      const count = random.int({ min: 1, max: 2 })
      const size = Math.max(3, scale * 0.45)
      for (let index = 0; index < count; index++) {
        plant({
          species: daisy,
          x: x + random.range({ min: -1, max: 1 }),
          top: rows * random.range({ min: 0.55, max: 0.82 }),
          size,
          palette: bloom(),
        })
      }
      return size * 2
    },
  })

  for (let x = 0; x < cols; x++) {
    if (random.chance(0.2)) {
      plant({
        species: grass,
        kind: 'blade',
        x,
        top: base - random.int({ min: 1, max: 3 }),
        size: 1,
        palette: greenery(random),
      })
    }
  }

  plant({
    species: ground,
    kind: 'ground',
    x: 0,
    top: base,
    size: 1,
    palette: greenery(random),
  })

  return { cols, rows, plants }
}
