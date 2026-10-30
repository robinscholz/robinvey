<template>
  <span class="inline-block align-middle" aria-hidden="true">
    <magic-dot-matrix
      :id="id"
      class="dot-matrix"
      :sequence="sequence"
      :options="options"
      :style="colors"
    />
  </span>
</template>

<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'

interface UiEmojiProps {
  symbol: string
  // Dots a side. The box is sized by whoever places the emoji.
  dots?: number
  // Plays once drawn, for a page the intro does not play on.
  autoplay?: boolean
  // Plays from the moment it is drawn and never stops.
  loop?: boolean
}

// Every dot matrix on the page shares the colour of its unlit dots, so the
// tint the sampler suggests is left out.
const INACTIVE = '--magic-dot-matrix-inactive-color'

// Unless it loops, the motion plays once, on the intro and on request, and
// rests in between.
const {
  symbol,
  dots = 12,
  autoplay = false,
  loop = false,
} = defineProps<UiEmojiProps>()

const id = useId()
const { on, off } = useUiEmitter()
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

const options = computed(() => ({
  ...emojiOptions.value,
  loop,
  autoplay: false,
}))

const colors = computed(() =>
  Object.fromEntries(
    Object.entries(style.value).filter(([name]) => name !== INACTIVE)
  )
)

// Most motions start at rest. One that starts from nothing, and ends there,
// rests on its first full frame instead.
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

// Public functions
function play() {
  if (motion.value !== 'reduce') {
    restart()
  }
}

on('afterIntro', play)

// The emoji is drawn once the component is up. The matrix resets to the
// first frame when the frames arrive, so the rest is set after it.
watch(
  sequence,
  () => {
    state.frame = rest.value
    if (autoplay || loop) {
      play()
    }
  },
  { flush: 'post' }
)

// Playing stops on the last frame, which may be empty.
watch(
  () => state.playing,
  (playing) => {
    if (!playing) {
      state.frame = rest.value
    }
  }
)

onScopeDispose(() => {
  off('afterIntro', play)
})

defineExpose({ play })
</script>
