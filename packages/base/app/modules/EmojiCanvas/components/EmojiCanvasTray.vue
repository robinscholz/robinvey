<template>
  <magic-tray-provider :id="TrayIds.EmojiCanvas" :options="options">
    <!-- The handle sits inside the edge rather than astride it: the half of it
         past the edge would widen the page, and a phone zooms out to fit. -->
    <magic-tray-content
      class="z-10 [--magic-tray-display:block] [--magic-tray-drag-overshoot-outer:0rem] [--magic-tray-handle-offset-x-right:0rem] [--magic-tray-handle-width-y:2.5rem] [--magic-tray-width:100%] md:[--magic-tray-handle-width-y:5rem]"
    >
      <!-- The page stays where it is and the clip cuts it away, so its fixed
           elements stay fixed. -->
      <div class="bg-surface-base min-h-dvh" :inert="opened || undefined">
        <slot />
      </div>
      <!-- While the canvas is open, the part of the page still in view is a
           drag surface for it, so the page can be pushed shut from anywhere
           on it; a tap closes it too. -->
      <magic-tray-trigger v-if="opened" side="right" as-child>
        <div class="absolute inset-0" @click="close" />
      </magic-tray-trigger>
      <template #handle>
        <div class="size-full" @click="toggle" />
      </template>
    </magic-tray-content>
  </magic-tray-provider>
</template>

<script setup lang="ts">
import { easeOutQuint } from '@maas/vue-equipment/utils'
import { useEventListener, useMediaQuery } from '@vueuse/core'
import { useEmojiCanvasTray } from '../composables/private/useEmojiCanvasTray'
import { TrayIds } from '../utils/enums'
import { PULL } from '../utils/pull'
import type { MagicTrayOptions } from '@maas/vue-equipment/plugins/MagicTray'

// How much of the viewport the open canvas takes. Half a phone’s would leave
// too little of it to see.
const OPEN = { narrow: 0.75, wide: 0.5 }

// The band the edge pulls back in, in pixels from the edge: the pull begins
// as the cursor comes within `start` and is complete at `stop`.
const BAND = { start: 160, stop: 48 }

const { opened, toggle, close } = useEmojiCanvasTray()

const wide = useMediaQuery('(width >= 48rem)')

// Only a cursor can near an edge; a finger is on it or it is not. So the
// pull is for fine pointers, and for visitors who allow motion.
const magnetic = useMediaQuery(
  '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
)

const open = computed(() => (wide.value ? OPEN.wide : OPEN.narrow))

// The canvas opens from the right edge alone. At rest, the edge pulls back
// towards a cursor nearing it, uncovering a sliver of the canvas: an
// invitation to drag.
const options = computed<MagicTrayOptions>(() => ({
  snapPoints: { right: [0, open.value] },
  handles: { right: true },
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
