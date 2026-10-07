<template>
  <span
    ><template v-for="(part, index) in parts" :key="index"
      ><span v-if="index > 0" class="mx-[0.125em]">–</span>{{ part }}</template
    ></span
  >
</template>

<script setup lang="ts">
interface UiRangeProps {
  value: string
}

const { value } = defineProps<UiRangeProps>()

// The face’s thin space is nearly as wide as a word space, so the dash in a
// range gets a true thin space either side from margins instead.
const parts = computed(() => value.split('–'))
</script>
