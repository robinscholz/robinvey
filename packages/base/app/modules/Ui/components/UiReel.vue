<template>
  <span class="relative inline-block" :data-spinning="spinning || null">
    <span class="in-data-spinning:invisible" v-text="symbol" />
    <span
      v-if="spinning"
      class="reel animate-reel"
      :style="{ '--reel-count': strip.length - 1, '--reel-order': order }"
      @animationend="stop"
    >
      <span
        v-for="(passing, index) in strip"
        :key="index"
        class="reel-symbol"
        :style="{ '--reel-index': index }"
        v-text="passing"
      />
    </span>
  </span>
</template>

<script setup lang="ts">
interface UiReelProps {
  symbol: string
  symbols?: Array<string>
}

// A reel lands at the time its order gives it, whatever it has to pass, so
// one with few symbols turns slowly and one with many whips round.
const MIN_COUNT = 6
const MAX_COUNT = 20

// The reel spins past its symbols on the way to the one it lands on.
const { symbol, symbols = [] } = defineProps<UiReelProps>()

const { on, off } = useUiEmitter()

// Reels hear the intro in page order, so each takes the next turn and they
// land from the top down, one after another.
const turns = useState('ui-reel-turns', () => 0)

// The symbols passing the window, ending on the reel’s own; empty at rest.
const strip = ref<Array<string>>([])
const spinning = computed(() => strip.value.length > 0)
const order = ref(0)

// No symbol shows twice in a row, so every step reads as a turn. A reel with
// nothing to pass stays still.
function spin() {
  const pool = symbols.filter((candidate) => candidate !== symbol)
  if (pool.length === 0) {
    return
  }
  order.value = turns.value
  turns.value += 1
  const count =
    MIN_COUNT + Math.floor(Math.random() * (MAX_COUNT - MIN_COUNT + 1))
  const passing = Array.from({ length: count }).reduce<Array<string>>(
    (passed) => {
      const options = pool.filter((candidate) => candidate !== passed.at(-1))
      const next = options[Math.floor(Math.random() * options.length)]
      return next ? [...passed, next] : passed
    },
    []
  )
  strip.value = [...passing, symbol]
}

function stop() {
  strip.value = []
}

on('beforeIntro', spin)

onScopeDispose(() => {
  off('beforeIntro', spin)
})
</script>
