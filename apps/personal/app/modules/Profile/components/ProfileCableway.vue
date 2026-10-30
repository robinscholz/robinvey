<template>
  <magic-dot-matrix
    :id="DotMatrixIds.Cableway"
    class="dot-matrix w-full max-w-[48ch] [--magic-dot-matrix-color-1:var(--app-color-surface-fg-subtle)] [--magic-dot-matrix-color-2:var(--app-color-surface-fg-muted)] [--magic-dot-matrix-color-3:currentColor] hover:text-(--ui-hue)"
    data-hue
    aria-hidden="true"
    :sequence="sequence"
    :options="options"
    @pointerenter="advance"
  />
</template>

<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import { createCableway, PANEL } from '../utils/cableway'
import { DotMatrixIds } from '../utils/enums'

const { advance } = useHue()
const motion = usePreferredReducedMotion()

const sequence = createCableway()

// With reduced motion the cabins wait at their stations.
const options = computed(() => ({
  ...PANEL,
  autoplay: motion.value !== 'reduce',
}))
</script>
