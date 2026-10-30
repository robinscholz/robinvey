<template>
  <span
    ref="frame"
    class="relative block data-overflowing:not-data-scrolling:mask-[linear-gradient(90deg,#000_calc(100%-1ch),transparent)] data-scrolling:mask-[linear-gradient(90deg,transparent,#000_1ch,#000_calc(100%-1ch),transparent)] max-md:motion-safe:overflow-x-clip"
    :data-overflowing="overflowing || null"
    :data-scrolling="scrolling || null"
  >
    <magic-marquee
      v-if="scrolling"
      :id="MarqueeIds.Title"
      :options="{ speed: SPEED }"
      class="[--magic-marquee-gap:2ch]"
    >
      <!-- The marquee lays its content out as flex items with the gap
           between them, so the text stays one item. -->
      <span><slot /></span>
    </magic-marquee>
    <span
      ref="model"
      class="block w-fit"
      :class="{
        'max-md:motion-safe:whitespace-nowrap': ready,
        'invisible absolute top-0 left-0': scrolling,
      }"
    >
      <slot />
    </span>
  </span>
</template>

<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import { MarqueeIds } from '../utils/enums'

interface UiMarqueeProps {
  playing?: boolean
}

const { playing = false } = defineProps<UiMarqueeProps>()

// About 25px a second, slow enough to read along.
const SPEED = 0.5

const frameRef = useTemplateRef('frame')
const modelRef = useTemplateRef('model')

// Text holds to one line only once the marquee can take over; without
// script, and for visitors who prefer reduced motion, it wraps.
const ready = shallowRef(false)
const overflowing = shallowRef(false)

// The marquee mounts afresh each time it plays, so a title that stops is
// back at its start.
const scrolling = computed(() => overflowing.value && playing)

// The model keeps the text on one line on narrow screens, so it is wider
// than the frame exactly when the text does not fit.
function detect() {
  if (!frameRef.value || !modelRef.value) {
    return
  }
  overflowing.value =
    modelRef.value.getBoundingClientRect().width >
    frameRef.value.getBoundingClientRect().width + 0.5
}

useResizeObserver(frameRef, detect)

onMounted(async () => {
  ready.value = true
  await nextTick()
  detect()
})
</script>
