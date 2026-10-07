import { useEventListener } from '@vueuse/core'

// The current hues live on <html>, so whatever is hovered or selected next
// can read them as --ui-hue and --ui-selection-hue without knowing who
// advanced them.
export default defineNuxtPlugin(() => {
  const { index, selection, advanceSelection, color } = useHue()

  useHead({
    htmlAttrs: {
      style: computed(() =>
        [
          index.value > 0 ? `--ui-hue: ${color(index.value)}` : '',
          `--ui-selection-hue: ${color(selection.value)}`,
        ]
          .filter(Boolean)
          .join('; ')
      ),
    },
  })

  if (import.meta.client) {
    useEventListener(document, 'selectstart', advanceSelection)
  }
})
