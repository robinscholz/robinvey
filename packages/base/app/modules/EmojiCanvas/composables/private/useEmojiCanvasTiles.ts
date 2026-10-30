interface Deadline {
  timeRemaining: () => number
}

type Draw = (symbol: string) => HTMLCanvasElement | undefined

// Tiles a turn, at most, between frames.
const BATCH = 8

// One tile for each emoji in the field, drawn a few at a time while the
// browser is idle, so a field of hundreds fills in without holding a frame.
// The tiles are read on every frame, so the map is plain.
export function useEmojiCanvasTiles(draw: Draw) {
  // Public state
  const tiles = new Map<string, HTMLCanvasElement>()

  // Private state
  const queue: Array<string> = []
  const pending = new Set<string>()
  let scheduled = false

  // Private functions
  function schedule() {
    if (scheduled || queue.length === 0 || !import.meta.client) {
      return
    }
    scheduled = true
    if ('requestIdleCallback' in window) {
      requestIdleCallback(work)
    } else {
      setTimeout(() => work(), 16)
    }
  }

  function work(deadline?: Deadline) {
    scheduled = false
    let count = 0
    while (
      queue.length > 0 &&
      count < BATCH &&
      (deadline?.timeRemaining() ?? 1) > 1
    ) {
      const symbol = queue.shift()
      if (symbol === undefined) {
        break
      }
      pending.delete(symbol)
      const tile = draw(symbol)
      if (tile) {
        tiles.set(symbol, tile)
      }
      count++
    }
    schedule()
  }

  // Public functions
  function request(symbols: Array<string>) {
    for (const symbol of symbols) {
      if (!tiles.has(symbol) && !pending.has(symbol)) {
        pending.add(symbol)
        queue.push(symbol)
      }
    }
    schedule()
  }

  return {
    tiles,
    request,
  }
}

export type UseEmojiCanvasTilesReturn = ReturnType<typeof useEmojiCanvasTiles>
