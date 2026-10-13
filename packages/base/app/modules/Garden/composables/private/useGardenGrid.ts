import { unrefElement, useElementSize } from '@vueuse/core'
import type { MaybeElementRef } from '@vueuse/core'

interface UseGardenGridOptions {
  area: MaybeElementRef
  text: MaybeElementRef
}

interface GardenCell {
  width: number
  height: number
}

// Enough glyphs that rounding in a single advance disappears.
const PROBE = 64

// How many cells of the face fit the area. The face is measured in the page,
// since a canvas ignores the variable font’s axes and would report another
// instance’s advance.
export function useGardenGrid({ area, text }: UseGardenGridOptions) {
  const { width, height } = useElementSize(area)

  // Public state
  const cell = shallowRef<GardenCell>({ width: 0, height: 0 })

  const cols = computed(() =>
    cell.value.width ? Math.floor(width.value / cell.value.width) : 0
  )
  const rows = computed(() =>
    cell.value.height ? Math.floor(height.value / cell.value.height) : 0
  )
  const aspect = computed(() =>
    cell.value.width ? cell.value.height / cell.value.width : 2
  )

  // Public functions
  function measure() {
    const element = unrefElement(text)
    if (!element) {
      return
    }
    const probe = document.createElement('span')
    probe.textContent = 'M'.repeat(PROBE)
    element.append(probe)
    const next = {
      width: probe.getBoundingClientRect().width / PROBE,
      height: parseFloat(getComputedStyle(element).lineHeight),
    }
    probe.remove()
    if (next.width !== cell.value.width || next.height !== cell.value.height) {
      cell.value = next
    }
  }

  // The type steps up a size at a breakpoint, so the cell is measured again
  // whenever the area changes.
  watch([width, height], measure)

  return {
    cell,
    cols,
    rows,
    aspect,
    measure,
  }
}

export type UseGardenGridReturn = ReturnType<typeof useGardenGrid>
