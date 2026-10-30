<template>
  <button
    type="button"
    class="flex cursor-pointer"
    aria-label="The next picture"
    @click="next"
  >
    <!-- A dot a character from 400px up; narrower than that, the matrix takes
         the whole width. -->
    <UiEmoji
      :symbol="symbol"
      :dots="DOTS"
      class="w-full min-[400px]:size-[32ch]"
      boot
    />
  </button>
</template>

<script setup lang="ts">
// A dot per character: 32 dots in 32ch.
const DOTS = 32

// The cableway first, the site’s own emblem, and the rest of the mountains
// behind it in an order drawn for the visit: the tramway, a paraglider,
// skis, a peak and a bike.
const FIRST = '🚠'
const OTHERS = ['🚡', '🪂', '🎿', '🏔️', '🚲']

function shuffled(items: Array<string>): Array<string> {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    const first = result[index] ?? ''
    result[index] = result[other] ?? ''
    result[other] = first
  }
  return result
}

const symbols = [FIRST, ...shuffled(OTHERS)]

const index = shallowRef(0)

const symbol = computed(() => symbols.at(index.value) ?? FIRST)

function next() {
  index.value = (index.value + 1) % symbols.length
}
</script>
