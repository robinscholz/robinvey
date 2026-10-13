interface RangePayload {
  min: number
  max: number
}

// A seed rebuilds the same garden, so a resize regrows the same plants to the
// new size instead of planting a new garden.
export function createRandom(seed: number) {
  let state = seed >>> 0

  // mulberry32
  function next(): number {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }

  function range({ min, max }: RangePayload): number {
    return min + next() * (max - min)
  }

  function int({ min, max }: RangePayload): number {
    return Math.floor(range({ min, max: max + 1 }))
  }

  function chance(probability: number): boolean {
    return next() < probability
  }

  function pick<ItemType>(items: ReadonlyArray<ItemType>): ItemType {
    const item = items[Math.floor(next() * items.length)]
    if (item === undefined) {
      throw new Error('Cannot pick from an empty list')
    }
    return item
  }

  return {
    next,
    range,
    int,
    chance,
    pick,
  }
}

export type GardenRandom = ReturnType<typeof createRandom>
