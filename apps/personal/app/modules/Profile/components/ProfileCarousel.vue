<template>
  <button
    type="button"
    class="flex cursor-pointer"
    aria-label="The next picture"
    @click="next"
  >
    <UiEmoji :symbol="symbol" :dots="DOTS" class="size-[32ch]" boot />
  </button>
</template>

<script setup lang="ts">
// A dot per character: 32 dots in 32ch.
const DOTS = 32

// The mountains, a click apart: the cableway, the tramway, a paraglider,
// skis, a peak and a bike.
const SYMBOLS = ['🚠', '🚡', '🪂', '🎿', '🏔️', '🚲']

const index = shallowRef(0)

const symbol = computed(() => SYMBOLS.at(index.value) ?? '🚠')

function next() {
  index.value = (index.value + 1) % SYMBOLS.length
}
</script>
