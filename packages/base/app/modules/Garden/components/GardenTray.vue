<template>
  <magic-tray-provider :id="TrayIds.Garden" :options="options">
    <magic-tray-content
      class="z-10 [--magic-tray-display:block] [--magic-tray-drag-overshoot-outer:0px] [--magic-tray-handle-width-y:2.5rem] [--magic-tray-width:100%] md:[--magic-tray-handle-width-y:5rem]"
    >
      <!-- The page slides with the clip by a transform of its own, which
           follows the pull as well as the drag; the tray’s own would follow
           the drag alone. -->
      <div
        class="bg-surface-base min-h-dvh"
        :inert="opened !== undefined || undefined"
        :style="
          shift ? { transform: `translate3d(${shift}px, 0, 0)` } : undefined
        "
      >
        <slot />
      </div>
      <!-- While a side is open, the part of the page still in view is a drag
           surface for it, so the page can be pushed shut from anywhere on
           it; a tap closes it too. -->
      <magic-tray-trigger v-if="opened" :side="opened" as-child>
        <div class="absolute inset-0" @click="close" />
      </magic-tray-trigger>
      <template #handle="{ side }">
        <div class="size-full" @click="toggle(side)" />
      </template>
    </magic-tray-content>
  </magic-tray-provider>
</template>

<script setup lang="ts">
import { easeOutQuint } from '@maas/vue-equipment/utils'
import { useEventListener, useMediaQuery } from '@vueuse/core'
import { useGardenPeek } from '../composables/private/useGardenPeek'
import { useGardenTray } from '../composables/private/useGardenTray'
import { TrayIds } from '../utils/enums'
import { PULL } from '../utils/pull'
import type { MagicTrayOptions } from '@maas/vue-equipment/plugins/MagicTray'

// How much of the viewport an open side uncovers. Half a phone’s would leave
// too little garden to see.
const OPEN = { narrow: 0.75, wide: 0.5 }

// The band the right edge pulls back in, in pixels from the edge: the pull
// begins as the cursor comes within `start` and is complete at `stop`.
const BAND = { start: 160, stop: 48 }

const { opened, engaged, shift, toggle, close } = useGardenTray()
useGardenPeek()

const wide = useMediaQuery('(width >= 48rem)')

// Only a cursor can near an edge; a finger is on it or it is not. So the
// pull is for fine pointers, and for visitors who allow motion.
const magnetic = useMediaQuery(
  '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
)

const open = computed(() => (wide.value ? OPEN.wide : OPEN.narrow))

// Once one side moves, the other side’s edge cannot be dragged until the
// first is back at rest. At rest, the right edge pulls back towards a cursor
// nearing it, uncovering a sliver of the garden: an invitation to drag.
const options = computed<MagicTrayOptions>(() => ({
  snapPoints: {
    left: [0, open.value],
    right: [0, open.value],
  },
  handles: engaged.value ? { [engaged.value]: true } : true,
  threshold: { distance: 48 },
  animation: { snap: { duration: 400, easing: easeOutQuint } },
  magnetism: magnetic.value
    ? { sides: { right: { 0: 'inner' } }, radius: BAND, pull: PULL }
    : undefined,
}))

useEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    close()
  }
})
</script>
