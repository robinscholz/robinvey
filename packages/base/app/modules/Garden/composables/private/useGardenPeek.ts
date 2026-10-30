import {
  easeInOutQuad,
  easeOutQuint,
  interpolate,
} from '@maas/vue-equipment/utils'
import { useMediaQuery, usePreferredReducedMotion } from '@vueuse/core'
import { TrayIds } from '../../utils/enums'
import { PULL } from '../../utils/pull'

interface RunPayload {
  from: number
  to: number
  duration: number
  easing: (t: number) => number
}

// The pull, the hold and the release, in milliseconds. The release takes
// the tray’s own snap, so the page lets go the way it does after a drag.
const DRAW = 350
const HOLD = 200
const RELEASE = 400

// After the intro has settled, or after a moment when it does not play.
const PAUSE = 600
const LATE = 2000

// A finger cannot near an edge the way a cursor does, so on a touch screen
// the page pulls back once by itself, a little, and lets go: a glimpse of
// the garden, and of the way to it. The pull rides on the tray’s magnetic
// offset, which the page slides with, as it does for the cursor’s pull.
export function useGardenPeek() {
  const { state } = useMagicTray(TrayIds.Garden)
  const { on, off } = useUiEmitter()
  const nuxtApp = useNuxtApp()
  const touch = useMediaQuery('(hover: none)')
  const motion = usePreferredReducedMotion()

  // Private state
  let frame: number | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  let hold: ReturnType<typeof setTimeout> | undefined
  let introduced = false

  // Private functions
  // A drag takes over wherever the peek is; the tray folds the offset into
  // the drag itself, so the page follows the finger from where it was.
  function cancel() {
    if (frame !== undefined) {
      cancelAnimationFrame(frame)
      frame = undefined
    }
    clearTimeout(timer)
    clearTimeout(hold)
    state.magnetic.right = 0
  }

  // Resolves once the offset has arrived; never, once cancelled.
  function run({ from, to, duration, easing }: RunPayload): Promise<void> {
    return new Promise((resolve) => {
      frame = interpolate({
        from,
        to,
        duration,
        easing,
        interpolationIdCallback: (id) => {
          frame = id
        },
        callback: (value) => {
          state.magnetic.right = value
          if (value === to) {
            frame = undefined
            resolve()
          }
        },
      })
    })
  }

  function wait(duration: number): Promise<void> {
    return new Promise((resolve) => {
      hold = setTimeout(resolve, duration)
    })
  }

  // Only with the right side at rest and nothing being dragged.
  async function peek() {
    if (
      !touch.value ||
      motion.value === 'reduce' ||
      state.dragging ||
      state.snapped.right > 0
    ) {
      return
    }
    await run({ from: 0, to: PULL, duration: DRAW, easing: easeInOutQuad })
    await wait(HOLD)
    await run({ from: PULL, to: 0, duration: RELEASE, easing: easeOutQuint })
  }

  function schedule(delay: number) {
    clearTimeout(timer)
    timer = setTimeout(peek, delay)
  }

  function introduce() {
    introduced = true
  }

  function settle() {
    schedule(PAUSE)
  }

  // The intro announces itself before the fallback is due; without it, the
  // page is simply there, and the peek follows a moment later.
  function fallback() {
    if (!introduced) {
      peek()
    }
  }

  on('beforeIntro', introduce)
  on('afterIntro', settle)

  if (import.meta.client) {
    nuxtApp.hook('app:suspense:resolve', () => {
      timer = setTimeout(fallback, LATE)
    })
  }

  watch(
    () => state.dragging,
    (dragging) => {
      if (dragging) {
        cancel()
      }
    }
  )

  onScopeDispose(() => {
    cancel()
    off('beforeIntro', introduce)
    off('afterIntro', settle)
  })
}
