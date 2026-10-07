<template>
  <NuxtLink
    :to="to"
    :external="file || undefined"
    :no-prefetch="file || undefined"
    :target="remote ? '_blank' : undefined"
    :class="classes"
    @pointerenter="underline && advance()"
  >
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
interface UiLinkProps {
  to: string
  underline?: boolean
}

const { to, underline = true } = defineProps<UiLinkProps>()

const { advance } = useHue()

const remote = computed(() => /^https?:\/\//.test(to))

// A file such as /cv.pdf is not a route, so the router must stay out of it.
const file = computed(() => to.startsWith('/') && /\.\w+$/.test(to))

const classes = computed(() =>
  underline
    ? 'underline decoration-1 underline-offset-[0.2em] hover:text-(--ui-hue)'
    : 'block outline-offset-0'
)
</script>
