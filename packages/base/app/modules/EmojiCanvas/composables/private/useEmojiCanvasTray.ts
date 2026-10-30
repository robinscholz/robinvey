import { TrayIds } from '../../utils/enums'
import type {
  MagicTraySnapEntry,
  MagicTraySnapPoint,
} from '@maas/vue-equipment/plugins/MagicTray'

// An inset shorter than this is rounding left over from a settle.
const EPSILON = 0.5

function isPoint(entry: MagicTraySnapEntry): entry is MagicTraySnapPoint {
  return typeof entry !== 'object'
}

// A snap point in pixels. The page rests at nothing or at a strip set in
// pixels; a fraction would need the width.
function pixels(point: MagicTraySnapPoint | undefined): number {
  return typeof point === 'string' ? parseFloat(point) : 0
}

export function useEmojiCanvasTray() {
  const { state, snapTo } = useMagicTray(TrayIds.EmojiCanvas)

  // Private state
  // The right edge’s snap points: the first where the page rests, the last
  // where it stands open.
  const points = computed(() =>
    (state.options.snapPoints.right ?? []).filter(isPoint)
  )
  const rest = computed(() => pixels(points.value[0]))

  // Public state
  // How far the page’s right edge stands in from the viewport’s, by the drag
  // and by the pull alike.
  const inset = computed(() => state.dragged.right + state.magnetic.right)

  // Any of the canvas in view, the strip at rest included.
  const revealed = computed(() => inset.value > EPSILON)

  // Pulled or dragged beyond where it rests.
  const moving = computed(() => inset.value > rest.value + EPSILON)

  const opened = computed(() => state.snapped.right > rest.value + EPSILON)

  // Public functions
  function close() {
    const point = points.value[0]
    if (opened.value && point !== undefined) {
      snapTo('right', point)
    }
  }

  // The edge closes the canvas when it is open, and opens it as far as the
  // last snap point when it is not.
  function toggle() {
    if (opened.value) {
      close()
      return
    }
    const point = points.value.at(-1)
    if (point !== undefined) {
      snapTo('right', point)
    }
  }

  return {
    inset,
    revealed,
    moving,
    opened,
    close,
    toggle,
  }
}

export type UseEmojiCanvasTrayReturn = ReturnType<typeof useEmojiCanvasTray>
