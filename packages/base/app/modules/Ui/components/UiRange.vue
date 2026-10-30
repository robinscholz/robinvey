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

// The dash in a range gets a thin space either side, from margins, so it
// reads the same in any face.
const parts = computed(() => value.split('–'))
</script>
