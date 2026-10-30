// One choreography for a switch that changes the whole page, as the colour
// mode’s does: the browser cross-fades the old page into the new where it
// can. Elsewhere, and with reduced motion, the change simply happens.
export function useSwitch() {
  // Public state
  // One switch at a time, whichever of them is asked.
  const switching = useState('ui-switching', () => false)

  // Public functions
  async function run(change: () => Promise<void> | void) {
    if (switching.value) {
      return
    }
    if (
      !('startViewTransition' in document) ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      await change()
      return
    }
    switching.value = true
    const transition = document.startViewTransition(async () => {
      await change()
      await nextTick()
    })
    await transition.finished
    switching.value = false
  }

  return {
    switching,
    run,
  }
}

export type UseSwitchReturn = ReturnType<typeof useSwitch>
