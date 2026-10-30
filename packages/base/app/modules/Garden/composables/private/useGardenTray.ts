import { TrayIds } from '../../utils/enums'

// An inset shorter than this is rounding left over from a settle.
const EPSILON = 0.5

export function useGardenTray() {
  const { state, snapTo } = useMagicTray(TrayIds.Garden)

  // Public state
  // How far the page’s right edge stands in from the viewport’s, by the drag
  // and by the pull alike.
  const inset = computed(() => state.dragged.right + state.magnetic.right)

  // Dragged aside, or pulled back a little, by the cursor or the peek.
  const revealed = computed(() => inset.value > EPSILON)

  const opened = computed(() => state.snapped.right > EPSILON)

  // Public functions
  function close() {
    if (opened.value) {
      snapTo('right', 0)
    }
  }

  // The edge closes the garden when it is open, and opens it as far as the
  // snap point when it is not.
  function toggle() {
    if (opened.value) {
      close()
      return
    }
    snapTo('right', 1)
  }

  return {
    inset,
    revealed,
    opened,
    close,
    toggle,
  }
}

export type UseGardenTrayReturn = ReturnType<typeof useGardenTray>
