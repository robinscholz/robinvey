<template>
  <ul
    v-if="wishes.length"
    class="grid grid-cols-1 gap-x-[3ch] gap-y-[2lh] sm:grid-cols-2 lg:grid-cols-3"
  >
    <WishCard v-for="wish in wishes" :key="wish.id" :wish="wish" />
  </ul>
  <p v-else class="text-surface-muted">Gerade nichts. Schön, oder?</p>
</template>

<script setup lang="ts">
interface WishGridProps {
  wishes: Array<Wish>
}

const { wishes } = defineProps<WishGridProps>()
</script>
