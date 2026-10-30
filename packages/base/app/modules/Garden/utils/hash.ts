interface CellPayload {
  col: number
  row: number
  seed: number
}

// A well mixed integer from a cell’s place and the visit’s seed, so
// neighbouring cells draw unrelated emoji and the field never repeats.
export function hashCell({ col, row, seed }: CellPayload): number {
  let hash =
    (Math.imul(col, 0x9e3779b1) ^ Math.imul(row, 0x85ebca77) ^ seed) >>> 0
  hash = Math.imul(hash ^ (hash >>> 15), 0x2c1b3c6d)
  hash = Math.imul(hash ^ (hash >>> 12), 0x297a2d39)
  return (hash ^ (hash >>> 15)) >>> 0
}
