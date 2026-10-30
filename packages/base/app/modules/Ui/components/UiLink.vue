<template>
  <nuxt-link
    ref="link"
    :to="to"
    :external="file || undefined"
    :no-prefetch="file || undefined"
    :target="remote ? '_blank' : undefined"
    :class="classes"
    :data-held="held || null"
  >
    <slot :held="held" />
  </nuxt-link>
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { useHold } from '../composables/useHold'

interface UiLinkProps {
  to: string
  underline?: boolean
  hold?: boolean
}

const { to, underline = true, hold = false } = defineProps<UiLinkProps>()

const linkRef = useTemplateRef('link')

// A held title scrolls only on phones that allow motion, so anywhere else a
// long press keeps the browser’s own link menu.
const holdable = useMediaQuery(
  '(width < 48rem) and (prefers-reduced-motion: no-preference)'
)

const { held } = useHold({
  target: () => linkRef.value?.$el,
  enabled: () => hold && holdable.value,
})

const remote = computed(() => /^https?:\/\//.test(to))

// A file such as /cv.pdf is not a route, so the router must stay out of it.
const file = computed(() => to.startsWith('/') && /\.\w+$/.test(to))

const classes = computed(() => [
  underline
    ? 'underline decoration-1 underline-offset-[0.2em]'
    : 'block outline-offset-0',
  {
    'max-md:motion-safe:select-none max-md:motion-safe:[-webkit-touch-callout:none] max-md:motion-safe:[-webkit-user-drag:none]':
      hold,
  },
])
</script>
