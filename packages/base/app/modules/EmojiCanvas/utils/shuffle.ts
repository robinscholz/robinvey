// A seeded Fisher–Yates shuffle, on mulberry32, so a block of the field is
// laid out the same way whenever it is listed.
export function shuffle<Item>(
  items: ReadonlyArray<Item>,
  seed: number
): Array<Item> {
  let state = seed >>> 0

  function next(): number {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }

  const order = items.map((_, index) => index)
  for (let index = order.length - 1; index > 0; index--) {
    const other = Math.floor(next() * (index + 1))
    const first = order[index] ?? index
    const second = order[other] ?? other
    order[index] = second
    order[other] = first
  }

  return order.flatMap((index) => {
    const item = items[index]
    return item === undefined ? [] : [item]
  })
}
