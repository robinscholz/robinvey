<template>
  <ul
    v-if="wishes.length"
    class="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 md:gap-x-12 md:gap-y-24 xl:grid-cols-3"
  >
    <WishCard v-for="wish in wishes" :key="wish.id" :wish="wish">
      <template v-if="$slots.actions" #actions>
        <slot name="actions" :wish="wish" />
      </template>
    </WishCard>
  </ul>
  <p v-else class="text-muted">Nothing right now.</p>
</template>

<script setup lang="ts">
interface WishGridProps {
  wishes: Array<Wish>
}

const { wishes } = defineProps<WishGridProps>()

defineSlots<{
  actions?: (props: { wish: Wish }) => unknown
}>()
</script>
