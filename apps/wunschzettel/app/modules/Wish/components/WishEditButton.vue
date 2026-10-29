<template>
  <WishButton size="sm" :flush="false" @click="edit(wish.id)">
    Edit<span class="sr-only">: {{ wish.title }}</span>
  </WishButton>
</template>

<script setup lang="ts">
interface WishEditButtonProps {
  wish: Wish
}

const { wish } = defineProps<WishEditButtonProps>()

const { edit } = useWishEditor()
</script>
