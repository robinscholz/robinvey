import { scramble, ScrambleSelector } from '../utils/scramble'

// Set on <html> while a switch changes the page; the page fades out, and
// back in once the change is in place.
export const SwitchFadeAttribute = 'data-switch-fade'

type SwitchFade = 'out' | 'in'

// The page scrambles in plain sight for 250ms and then fades out over 90ms
// (both in main.css); the hold outlasts the two, so the page changes while
// it is hidden. After the 100ms fade back in, the run settles over the
// same 250ms the page scrambled before it faded.
const HOLD = 360
const DURATION = 350

// One choreography for a switch that changes the whole page, as the colour
// mode’s does.
export function useSwitch() {
  // Public state
  // One switch at a time, whichever of them is asked.
  const switching = useState('ui-switching', () => false)

  // Private functions
  function fade(direction?: SwitchFade) {
    const html = document.documentElement
    if (!direction) {
      html.removeAttribute(SwitchFadeAttribute)
      return
    }
    html.setAttribute(SwitchFadeAttribute, direction)
  }

  // Public functions
  // The page scrambles and fades out, changes while it is hidden, and fades
  // back in as noise before the text settles into the change. Without
  // motion, the change simply happens.
  async function run(change: () => Promise<void> | void) {
    if (switching.value) {
      return
    }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await change()
      return
    }
    switching.value = true
    fade('out')
    await scramble({
      roots: [...document.querySelectorAll(ScrambleSelector)],
      duration: DURATION,
      hold: HOLD,
      swap: async () => {
        await change()
        fade('in')
      },
    })
    fade()
    switching.value = false
  }

  return {
    switching,
    run,
  }
}

export type UseSwitchReturn = ReturnType<typeof useSwitch>
