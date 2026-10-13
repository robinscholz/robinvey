import type { GardenPlant } from './grow'

interface BreezePayload {
  x: number
  cols: number
  time: number
  direction: number
  position: number
}

interface FrequencyPayload {
  plant: GardenPlant
  rows: number
}

// Even between gusts the air leans every plant a little downwind.
const CALM = 0.1

// Seconds between gusts at any one spot. Each crosses the garden in about
// that time, so one is usually on its way.
const PERIOD = 5

// The gusts come and go in strength over this many seconds.
const SWELL = 13

// How far a plant trembles on its own, as a share of a full lean.
const FLUTTER = 0.2

function wave(phase: number): number {
  return (1 + Math.sin(phase)) / 2
}

// How far the wind leans a plant at a moment, from 0 to about 1, signed by
// the way it blows. Gusts are bands of strong air travelling downwind,
// raised to a power so the air between them stays calm; a faster, narrower
// band of eddies runs across them.
export function breeze({
  x,
  cols,
  time,
  direction,
  position,
}: BreezePayload): number {
  const across = (x / Math.max(1, cols)) * direction
  const gust = wave(2 * Math.PI * (across / 0.9 - time / PERIOD)) ** 3
  const eddy =
    0.45 * wave(2 * Math.PI * (across / 0.35 - time / (PERIOD * 0.6)) + 2) ** 4
  const strength = 0.6 + 0.4 * Math.sin((2 * Math.PI * time) / SWELL + 1)
  const flutter =
    FLUTTER *
    Math.sin(2 * Math.PI * time * (0.9 + (position % 7) * 0.1) + position)
  const air = CALM + (1 - CALM) * Math.min(1, (gust + eddy) * strength)
  return direction * air + flutter
}

// Swings per second. Tall plants swing slowly, short ones and blades of grass
// quickly.
export function frequency({ plant, rows }: FrequencyPayload): number {
  if (plant.kind === 'blade') {
    return 1.4
  }
  const height = (rows - 1 - plant.crown) / Math.max(1, rows)
  return Math.min(1.4, Math.max(0.5, 1.5 - height * 1.4))
}
