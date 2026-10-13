<template>
  <magic-tray-provider :id="TrayIds.Garden" :options="options">
    <magic-tray-content
      class="z-10 [--magic-tray-display:block] [--magic-tray-drag-overshoot-outer:0px] [--magic-tray-handle-width-y:2.5rem] [--magic-tray-width:100%] md:[--magic-tray-handle-width-y:5rem]"
    >
      <magic-tray-transform axis="x" :disabled="!engaged">
        <div
          class="bg-surface-base min-h-dvh"
          :inert="opened !== undefined || undefined"
        >
          <slot />
        </div>
      </magic-tray-transform>
      <div v-if="opened" class="absolute inset-0" @click="close" />
      <template #handle="{ side }">
        <div class="size-full" @click="toggle(side)" />
      </template>
    </magic-tray-content>
  </magic-tray-provider>
</template>

<script setup lang="ts">
import { easeOutQuint } from '@maas/vue-equipment/utils'
import { useEventListener, useMediaQuery } from '@vueuse/core'
import { useGardenTray } from '../composables/private/useGardenTray'
import { TrayIds } from '../utils/enums'
import type { MagicTrayOptions } from '@maas/vue-equipment/plugins/MagicTray'

// How much of the viewport an open side uncovers. Half a phone’s would leave
// too little garden to see.
const OPEN = { narrow: 0.75, wide: 0.5 }

const { opened, engaged, toggle, close } = useGardenTray()

const wide = useMediaQuery('(width >= 48rem)')

const open = computed(() => (wide.value ? OPEN.wide : OPEN.narrow))

// Once one side moves, the other side’s edge cannot be dragged until the
// first is back at rest. The page slides with the edge only while it is away
// from rest, as a transformed ancestor would pin the page’s fixed elements to
// the page instead of the viewport.
const options = computed<MagicTrayOptions>(() => ({
  snapPoints: {
    left: [0, open.value],
    right: [0, open.value],
  },
  handles: engaged.value ? { [engaged.value]: true } : true,
  threshold: { distance: 48 },
  animation: { snap: { duration: 400, easing: easeOutQuint } },
}))

useEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    close()
  }
})
</script>
