<template>
  <ul v-if="wishes.length" class="grid-wishes">
    <template v-for="(wish, index) in wishes" :key="wish.id">
      <slot :wish="wish" :index="index" :preload="index < PRELOADED">
        <wish-card :wish="wish" :preload="index < PRELOADED" />
      </slot>
    </template>
  </ul>
  <p v-else class="text-surface-muted">Nothing right now.</p>
</template>

<script setup lang="ts">
interface WishGridProps {
  wishes: Array<Wish>
}

// The first row at its widest, whose pictures come with the page instead of
// waiting until they scroll into view.
const PRELOADED = 4

const { wishes } = defineProps<WishGridProps>()

defineSlots<{
  default?: (props: { wish: Wish; index: number; preload: boolean }) => unknown
}>()
</script>
