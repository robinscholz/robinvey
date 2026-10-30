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
  // Builds up row by row from the bottom before the motion plays, and when
  // the emoji changes, takes the old one down row by row from the top first.
  boot?: boolean
}

type Pass = 'in' | 'out'

// Every dot matrix on the page shares the colour of its unlit dots, so the
// tint the sampler suggests is left out.
const INACTIVE = '--magic-dot-matrix-inactive-color'

// How long each row of a pass shows before the next.
const PASS_INTERVAL = 30

// The emoji’s motion loops from the moment it is drawn. With reduced motion
// the emoji stands still on a full frame.
const { symbol, dots = 12, boot = false } = defineProps<UiEmojiProps>()

const id = useId()
const motion = usePreferredReducedMotion()
const { state, restart } = useMagicDotMatrix(id)

// The emoji drawn, which follows the one asked for once the old one is down.
const drawn = shallowRef(symbol)

const {
  sequence,
  options: emojiOptions,
  style,
} = useMagicDotMatrixEmoji(drawn, () => ({ cols: dots, rows: dots }))

// The frames of a pass while one plays, and which way it goes.
const pass = shallowRef<Array<DotMatrixLayeredFrame>>()
let direction: Pass = 'in'

const still = computed(() => motion.value === 'reduce')

const shown = computed(() => pass.value ?? sequence.value)

const options = computed(() =>
  pass.value
    ? {
        cols: dots,
        rows: dots,
        interval: PASS_INTERVAL,
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

function rows(
  frame: DotMatrixLayeredFrame,
  keep: (row: number) => boolean
): DotMatrixLayeredFrame {
  return frame.map((layer) =>
    layer.filter((dot) => keep(Math.floor(dot / dots)))
  )
}

// The frame built up a row at a time from the bottom: each frame holds the
// rows from the bottom up to its own, and the last holds them all.
function rise(target: DotMatrixLayeredFrame): Array<DotMatrixLayeredFrame> {
  return Array.from({ length: dots }, (_, index) =>
    rows(target, (row) => row >= dots - 1 - index)
  )
}

// The frame taken down a row at a time from the top, to nothing.
function fall(target: DotMatrixLayeredFrame): Array<DotMatrixLayeredFrame> {
  return Array.from({ length: dots }, (_, index) =>
    rows(target, (row) => row > index)
  )
}

function run(frames: Array<DotMatrixLayeredFrame>, way: Pass) {
  pass.value = frames
  direction = way
  nextTick(restart)
}

// Plays the motion from its resting frame.
function play() {
  pass.value = undefined
  nextTick(() => {
    restart()
    state.frame = rest.value
  })
}

// The drawn emoji comes in: built up from the bottom when it boots, at once
// otherwise.
function enter() {
  const target = sequence.value[rest.value]
  if (still.value) {
    pass.value = undefined
    state.frame = rest.value
    return
  }
  if (boot && target && target.flat().length > 0) {
    run(rise(target), 'in')
    return
  }
  play()
}

// The emoji is drawn once the component is up, and again whenever the drawn
// one changes. The matrix resets to the first frame when frames arrive, so
// this runs after it.
watch(sequence, enter, { flush: 'post' })

// A new emoji takes the old one down first, from the frame on show, and is
// drawn once the old one is gone. Without the boot, or motion, it is drawn
// straight away.
watch(
  () => symbol,
  (next) => {
    if (!boot || still.value) {
      drawn.value = next
      return
    }
    const frame = shown.value[state.frame]
    if (frame && frame.flat().length > 0) {
      run(fall(frame), 'out')
      return
    }
    drawn.value = next
  }
)

// A pass stops on its last frame. After the fall the asked emoji is drawn,
// and its frames bring the rise; after the rise the motion takes over.
watch(
  () => state.playing,
  (playing) => {
    if (playing || !pass.value) {
      return
    }
    if (direction === 'out') {
      if (drawn.value === symbol) {
        enter()
      } else {
        drawn.value = symbol
      }
      return
    }
    play()
  }
)
</script>
