<template>
  <button
    type="button"
    class="flex cursor-pointer"
    aria-label="The other cable car"
    @click="toggle"
  >
    <UiEmoji :symbol="symbol" :dots="DOTS" class="size-[32ch]" loop />
  </button>
</template>

<script setup lang="ts">
// A dot per character: 32 dots in 32ch.
const DOTS = 32

// The mountain cableway and the aerial tramway, a click apart.
const CABLEWAY = '🚠'
const TRAMWAY = '🚡'

const symbol = shallowRef(CABLEWAY)

function toggle() {
  symbol.value = symbol.value === CABLEWAY ? TRAMWAY : CABLEWAY
}
</script>
