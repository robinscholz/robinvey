// The intro’s lifecycle, which fires only when the intro plays.
export type UiEvents = {
  beforeIntro: undefined
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
