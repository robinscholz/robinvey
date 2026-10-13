import { TrayIds } from '../../utils/enums'
import type { MagicTraySide } from '@maas/vue-equipment/plugins/MagicTray'

const SIDES: Array<MagicTraySide> = ['left', 'right']

// An inset shorter than this is rounding left over from a settle.
const EPSILON = 0.5

export function useGardenTray() {
  const { state, snapTo } = useMagicTray(TrayIds.Garden)

  // Public state
  const revealed = computed(() =>
    SIDES.some((side) => state.dragged[side] > EPSILON)
  )

  const opened = computed(() =>
    SIDES.find((side) => state.snapped[side] > EPSILON)
  )

  // The side being dragged, or away from rest, while the other has to wait.
  const engaged = computed(
    () =>
      state.draggingSide ?? SIDES.find((side) => state.dragged[side] > EPSILON)
  )

  // Open, let go of and done snapping.
  const settled = computed(() => {
    const side = opened.value
    return (
      side !== undefined &&
      !state.dragging &&
      Math.abs(state.dragged[side] - state.snapped[side]) < EPSILON
    )
  })

  // How far each edge of the page stands in from the viewport’s.
  const insets = computed(() => ({
    left: state.dragged.left,
    right: state.dragged.right,
  }))

  // Public functions
  function close() {
    for (const side of SIDES) {
      if (state.snapped[side] > EPSILON) {
        snapTo(side, 0)
      }
    }
  }

  // An edge closes an open side and opens a closed one, as far as its
  // furthest snap point.
  function toggle(side: MagicTraySide) {
    if (opened.value) {
      close()
      return
    }
    snapTo(side, 1)
  }

  return {
    revealed,
    opened,
    engaged,
    settled,
    insets,
    close,
    toggle,
  }
}

export type UseGardenTrayReturn = ReturnType<typeof useGardenTray>
