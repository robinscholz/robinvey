<template>
  <header class="grid-page items-baseline gap-y-[1lh] pt-6 pb-12 md:pt-10">
    <div>
      <h1 class="font-medium">{{ list.title }}</h1>
      <p class="text-surface-muted">
        {{ list.name }}<br />
        Stand {{ updated }}
      </p>
    </div>
    <p>{{ list.intro }}</p>
  </header>
</template>

<script setup lang="ts">
interface WishHeaderProps {
  list: List
  updated: string
}

const { list, updated } = defineProps<WishHeaderProps>()
</script>
