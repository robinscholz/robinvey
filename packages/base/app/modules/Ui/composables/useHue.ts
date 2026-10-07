// One per `app.color.hue.*` token in the robinvey theme.
const HUE_COUNT = 7

export function useHue() {
  // Private state
  const pins = useState<Record<string, number>>('ui-hue-pins', () => ({}))

  // Public state
  const index = useState('ui-hue', () => 0)
  const selection = useState('ui-hue-selection', () => HUE_COUNT)

  // Public functions
  function advance() {
    index.value = (index.value % HUE_COUNT) + 1
  }

  // Selections keep their own count, so dragging across rows that advance
  // the hover hue cannot recolour a selection while it is being made.
  function advanceSelection() {
    selection.value = (selection.value % HUE_COUNT) + 1
  }

  function pin(id: string) {
    pins.value = { ...pins.value, [id]: index.value }
  }

  function pinned(id: string): number {
    return pins.value[id] ?? 0
  }

  function color(hue: number): string {
    return hue > 0 ? `var(--app-color-hue-${hue})` : ''
  }

  return {
    index,
    selection,
    advance,
    advanceSelection,
    pin,
    pinned,
    color,
  }
}

export type UseHueReturn = ReturnType<typeof useHue>
