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
  // Lights up from noise before the motion plays, whenever it is drawn.
  boot?: boolean
}

// Every dot matrix on the page shares the colour of its unlit dots, so the
// tint the sampler suggests is left out.
const INACTIVE = '--magic-dot-matrix-inactive-color'

// The boot: frames of noise, how long each shows, and how much of the run
// passes before the first dot settles into place.
const BOOT_FRAMES = 16
const BOOT_INTERVAL = 50
const BOOT_START = 0.25

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
const noise = shallowRef<Array<DotMatrixLayeredFrame>>([])

const still = computed(() => motion.value === 'reduce')

const shown = computed(() => (booting.value ? noise.value : sequence.value))

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

// Noise that settles into the frame: each dot takes its own moment to
// settle, and until then flickers at the frame’s own density, in any of
// its colours. The last frame of noise is the frame itself.
function scramble(target: DotMatrixLayeredFrame): Array<DotMatrixLayeredFrame> {
  const total = dots * dots
  const lit = new Map<number, number>()
  target.forEach((layer, index) => {
    layer.forEach((dot) => lit.set(dot, index))
  })
  const density = lit.size / total
  const settle = Array.from(
    { length: total },
    () => BOOT_START + Math.random() * (1 - BOOT_START)
  )
  return Array.from({ length: BOOT_FRAMES }, (_, index) => {
    const progress = (index + 1) / BOOT_FRAMES
    const frame: DotMatrixLayeredFrame = target.map(() => [])
    for (let dot = 0; dot < total; dot++) {
      if (progress >= (settle[dot] ?? 1)) {
        const layer = lit.get(dot)
        if (layer !== undefined) {
          frame[layer]?.push(dot)
        }
      } else if (Math.random() < density) {
        frame[Math.floor(Math.random() * target.length)]?.push(dot)
      }
    }
    return frame
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
      noise.value = scramble(target)
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
