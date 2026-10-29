<template>
  <ul
    v-if="wishes.length"
    class="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 md:gap-x-12 md:gap-y-24 xl:grid-cols-3"
  >
    <template v-for="(wish, index) in wishes" :key="wish.id">
      <slot :wish="wish" :index="index">
        <WishCard :wish="wish" />
      </slot>
    </template>
  </ul>
  <p v-else class="text-surface-muted">Nothing right now.</p>
</template>

<script setup lang="ts">
interface WishGridProps {
  wishes: Array<Wish>
}

const { wishes } = defineProps<WishGridProps>()

defineSlots<{
  default?: (props: { wish: Wish; index: number }) => unknown
}>()
</script>
