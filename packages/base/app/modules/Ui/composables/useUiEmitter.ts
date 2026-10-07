// The intro’s lifecycle; it only fires when the intro plays.
export type UiEvents = {
  beforeIntro: undefined
  introProgress: number
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
