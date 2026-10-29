<template>
  <button
    type="button"
    class="text-muted hover:text-ink cursor-pointer bg-white py-1 pl-2"
    @click="edit(wish.id)"
  >
    Edit<span class="sr-only">: {{ wish.title }}</span>
  </button>
</template>

<script setup lang="ts">
interface WishEditButtonProps {
  wish: Wish
}

const { wish } = defineProps<WishEditButtonProps>()

const { edit } = useWishEditor()
</script>
