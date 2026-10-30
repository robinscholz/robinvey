import { TrayIds } from '../../utils/enums'
import type { MagicTraySide } from '@maas/vue-equipment/plugins/MagicTray'

const SIDES: Array<MagicTraySide> = ['left', 'right']

// An inset shorter than this is rounding left over from a settle.
const EPSILON = 0.5

export function useGardenTray() {
  const { state, snapTo } = useMagicTray(TrayIds.Garden)

  // Public state
  // Dragged aside, or pulled back a little, by the cursor or the peek.
  const revealed = computed(() =>
    SIDES.some((side) => state.dragged[side] + state.magnetic[side] > EPSILON)
  )

  const opened = computed(() =>
    SIDES.find((side) => state.snapped[side] > EPSILON)
  )

  // The side being dragged, or away from rest, while the other has to wait.
  const engaged = computed(
    () =>
      state.draggingSide ?? SIDES.find((side) => state.dragged[side] > EPSILON)
  )

  // How far each edge of the page stands in from the viewport’s, by the drag
  // and by the pull alike.
  const insets = computed(() => ({
    left: state.dragged.left + state.magnetic.left,
    right: state.dragged.right + state.magnetic.right,
  }))

  // How far the page has moved along, with its edges: dragged or pulled, as
  // one offset, so a drag or a click after a pull carries on from where the
  // page already is. Zero at rest, so the page carries no transform then: a
  // transformed ancestor would pin its fixed elements to the page instead
  // of the viewport.
  const shift = computed(() => {
    const x =
      state.dragged.left +
      state.magnetic.left -
      state.dragged.right -
      state.magnetic.right
    return Math.abs(x) > EPSILON ? x : 0
  })

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
    insets,
    shift,
    close,
    toggle,
  }
}

export type UseGardenTrayReturn = ReturnType<typeof useGardenTray>
