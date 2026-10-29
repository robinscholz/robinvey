<template>
  <p>Drag this link into the bookmarks bar:</p>
  <p class="mt-6">
    <a :href="href" class="link" @click.prevent>🎁 Wish</a>
  </p>
  <p class="text-muted mt-6">
    Clicked on a product page, it brings title, picture and price here.
    <a href="/auth/logout" class="link">Sign out</a>
  </p>
</template>

<script setup lang="ts">
const { href } = useBookmarklet()
</script>
