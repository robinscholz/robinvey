import { sampleEmoji } from '../../utils/sample'
import type { EmojiSample } from '../../utils/sample'

interface Deadline {
  timeRemaining: () => number
}

// Samples a turn, at most, between frames.
const BATCH = 8

// One still for each emoji in the field, drawn a few at a time while the
// browser is idle, so a field of hundreds fills in without holding a frame.
// An emoji the system cannot draw is kept as null, so it is not tried again.
export function useGardenSamples(dots: number) {
  // Private state
  const samples = shallowReactive(new Map<string, EmojiSample | null>())
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
      samples.set(symbol, sampleEmoji({ symbol, dots }) ?? null)
      count++
    }
    schedule()
  }

  // Public functions
  function request(symbols: Array<string>) {
    for (const symbol of symbols) {
      if (!samples.has(symbol) && !pending.has(symbol)) {
        pending.add(symbol)
        queue.push(symbol)
      }
    }
    schedule()
  }

  return {
    samples,
    request,
  }
}

export type UseGardenSamplesReturn = ReturnType<typeof useGardenSamples>
