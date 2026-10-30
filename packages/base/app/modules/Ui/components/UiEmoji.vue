<template>
  <span class="inline-block align-middle" aria-hidden="true">
    <magic-dot-matrix
      :id="id"
      class="dot-matrix"
      :sequence="shown"
      :options="options"
      :style="colors"
    />
  </span>
</template>

<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import type { DotMatrixLayeredFrame } from '@maas/vue-equipment/plugins/MagicDotMatrix'

interface UiEmojiProps {
  symbol: string
  // Dots a side. The box is sized by whoever places the emoji.
  dots?: number
  // Builds up row by row from the bottom before the motion plays, whenever
  // it is drawn.
  boot?: boolean
}

// Every dot matrix on the page shares the colour of its unlit dots, so the
// tint the sampler suggests is left out.
const INACTIVE = '--magic-dot-matrix-inactive-color'

// How long each row of the boot shows before the next comes on.
const BOOT_INTERVAL = 30

// The emoji’s motion loops from the moment it is drawn. With reduced motion
// the emoji stands still on a full frame.
const { symbol, dots = 12, boot = false } = defineProps<UiEmojiProps>()

const id = useId()
const motion = usePreferredReducedMotion()
const { state, restart } = useMagicDotMatrix(id)
const {
  sequence,
  options: emojiOptions,
  style,
} = useMagicDotMatrixEmoji(
  () => symbol,
  () => ({ cols: dots, rows: dots })
)

const booting = shallowRef(false)
const rising = shallowRef<Array<DotMatrixLayeredFrame>>([])

const still = computed(() => motion.value === 'reduce')

const shown = computed(() => (booting.value ? rising.value : sequence.value))

const options = computed(() =>
  booting.value
    ? {
        cols: dots,
        rows: dots,
        interval: BOOT_INTERVAL,
        loop: false,
        autoplay: false,
      }
    : { ...emojiOptions.value, loop: true, autoplay: false }
)

const colors = computed(() =>
  Object.fromEntries(
    Object.entries(style.value).filter(([name]) => name !== INACTIVE)
  )
)

// Most motions start at rest. One that starts from nothing rests on its
// first full frame instead.
const rest = computed(() => {
  const counts = sequence.value.map((frame) => frame.flat().length)
  if (counts[0]) {
    return 0
  }
  const full = Math.max(0, ...counts)
  return Math.max(
    0,
    counts.findIndex((count) => count === full)
  )
})

// The frame built up a row at a time from the bottom: each frame of the boot
// holds the rows of the target from the bottom up to its own, and the last
// holds them all.
function rise(target: DotMatrixLayeredFrame): Array<DotMatrixLayeredFrame> {
  return Array.from({ length: dots }, (_, index) => {
    const top = dots - 1 - index
    return target.map((layer) =>
      layer.filter((dot) => Math.floor(dot / dots) >= top)
    )
  })
}

// Plays the motion from its resting frame.
function play() {
  restart()
  state.frame = rest.value
}

// The emoji is drawn once the component is up, and again whenever it
// changes. The matrix resets to the first frame when frames arrive, so this
// runs after it.
watch(
  sequence,
  (frames) => {
    const target = frames[rest.value]
    if (still.value) {
      state.frame = rest.value
      return
    }
    if (boot && target && target.flat().length > 0) {
      rising.value = rise(target)
      booting.value = true
      nextTick(restart)
      return
    }
    play()
  },
  { flush: 'post' }
)

// The boot plays once and stops; the motion takes over from where it left.
watch(
  () => state.playing,
  (playing) => {
    if (!playing && booting.value) {
      booting.value = false
      nextTick(play)
    }
  }
)
</script>
