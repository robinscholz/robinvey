import { usePreferredReducedMotion, useRafFn } from '@vueuse/core'
import { breeze, frequency } from '../../utils/wind'
import type { Garden, GardenPlant } from '../../utils/grow'

interface UseGardenWindOptions {
  garden: Readonly<ShallowRef<Garden | undefined>>
  active: MaybeRefOrGetter<boolean>
}

interface NudgePayload {
  plant: number
  force: number
}

interface StepPayload {
  delta: number
}

interface AimPayload {
  garden: Garden
  plant: GardenPlant
  position: number
}

// The glyphs move in whole cells, so redrawing more often only costs.
const FPS = 30

// Below 1, so a plant overshoots and settles the way a stalk does.
const DAMPING = 0.2

// No push leans a plant further than this, however hard the pointer swipes.
const LIMIT = 1.6

// Every plant hangs on a damped spring and chases the lean the wind gives it
// at its spot, so tall plants lag behind a gust and swing on after it. The
// wind blows one way for the whole visit and only while the garden shows.
export function useGardenWind({ garden, active }: UseGardenWindOptions) {
  const motion = usePreferredReducedMotion()

  // Private state
  const direction = Math.random() < 0.5 ? -1 : 1
  let velocities = new Float32Array(0)
  let time = 0

  // Public state
  const leans = shallowRef(new Float32Array(0))

  // Private functions
  function aim({ garden: current, plant, position }: AimPayload): number {
    return breeze({
      x: plant.x,
      cols: current.cols,
      time,
      direction,
      position,
    })
  }

  function step({ delta }: StepPayload) {
    const current = garden.value
    if (!current || leans.value.length !== current.plants.length) {
      return
    }
    const seconds = Math.min(delta, 100) / 1000
    time += seconds
    for (const [position, plant] of current.plants.entries()) {
      const target = aim({ garden: current, plant, position })
      const omega = 2 * Math.PI * frequency({ plant, rows: current.rows })
      const lean = leans.value[position] ?? 0
      const velocity =
        (velocities[position] ?? 0) +
        (omega ** 2 * (target - lean) -
          2 * DAMPING * omega * (velocities[position] ?? 0)) *
          seconds
      velocities[position] = velocity
      leans.value[position] = Math.min(
        LIMIT,
        Math.max(-LIMIT, lean + velocity * seconds)
      )
    }
    triggerRef(leans)
  }

  const { pause, resume } = useRafFn(step, {
    immediate: false,
    fpsLimit: FPS,
  })

  // Public functions
  // A push in leans per second, as from a pointer brushing through.
  function nudge({ plant, force }: NudgePayload) {
    if (plant > 0 && plant <= velocities.length) {
      velocities[plant - 1] = (velocities[plant - 1] ?? 0) + force
    }
  }

  // A new garden starts where the wind already has it, so its plants sway on
  // from the first frame instead of all lurching off upright together.
  watch(garden, (value) => {
    const count = value?.plants.length ?? 0
    if (count === leans.value.length) {
      return
    }
    velocities = new Float32Array(count)
    leans.value =
      value && motion.value !== 'reduce'
        ? Float32Array.from(value.plants, (plant, position) =>
            aim({ garden: value, plant, position })
          )
        : new Float32Array(count)
  })

  watch(
    () => toValue(active) && motion.value !== 'reduce',
    (blowing) => (blowing ? resume() : pause()),
    { immediate: true }
  )

  return {
    leans,
    nudge,
  }
}

export type UseGardenWindReturn = ReturnType<typeof useGardenWind>
