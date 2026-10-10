// The intro’s lifecycle fires only when the intro plays; progress fires for
// every scramble, the intro’s and the typeface switch’s.
export type UiEvents = {
  beforeIntro: undefined
  scrambleProgress: number
  afterIntro: undefined
}

export function useUiEmitter() {
  const { $uiEmitter } = useNuxtApp()

  return {
    on: $uiEmitter.on,
    off: $uiEmitter.off,
    emit: $uiEmitter.emit,
  }
}

export type UseUiEmitterReturn = ReturnType<typeof useUiEmitter>
