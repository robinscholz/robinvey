<template>
  <div class="flex">
    <UiEmoji symbol="🚠" :dots="DOTS" class="size-[32ch]" loop />
  </div>
</template>

<script setup lang="ts">
// A dot per character: 32 dots in 32ch.
const DOTS = 32
</script>
