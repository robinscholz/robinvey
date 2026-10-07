<template>
  <UiLink :to="href"><slot /></UiLink>
</template>

<script setup lang="ts">
interface ProseAProps {
  href: string
}

const { href } = defineProps<ProseAProps>()
</script>
