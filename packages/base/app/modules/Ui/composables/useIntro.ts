import { scramble, ScrambleSelector } from '../utils/scramble'

// Set on <html> before the first paint, hiding everything under
// [data-scramble] until the intro plays. CSS reveals it after two seconds if
// the intro never does.
export const IntroAttribute = 'data-intro'

// Past this point, in milliseconds since navigation, the fallback is about
// to reveal the text, so it appears without the scramble.
const LATE = 1500
const DURATION = 500

export function useIntro() {
  const { emit } = useUiEmitter()

  // Public functions
  // Listeners hear the whole run, from before the text shows to after it has
  // settled, or nothing when the intro does not play.
  async function start() {
    await document.fonts.ready
    const html = document.documentElement
    const play = html.hasAttribute(IntroAttribute) && performance.now() < LATE
    if (!play) {
      html.removeAttribute(IntroAttribute)
      return
    }
    emit('beforeIntro')
    const scrambling = scramble({
      roots: [...document.querySelectorAll(ScrambleSelector)],
      duration: DURATION,
    })
    html.removeAttribute(IntroAttribute)
    await scrambling
    emit('afterIntro')
  }

  return {
    start,
  }
}

export type UseIntroReturn = ReturnType<typeof useIntro>
