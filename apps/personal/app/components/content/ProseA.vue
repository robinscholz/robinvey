<template>
  <!-- A link in the prose names something, so it stays on one line. -->
  <UiLink :to="href" class="whitespace-nowrap"><slot /></UiLink>
</template>

<script setup lang="ts">
interface ProseAProps {
  href: string
}

const { href } = defineProps<ProseAProps>()
</script>
