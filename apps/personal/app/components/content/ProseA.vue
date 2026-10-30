<template>
  <!-- A link in the prose names something, so it stays on one line. -->
  <ui-link :to="href" class="whitespace-nowrap"><slot /></ui-link>
</template>

<script setup lang="ts">
interface ProseAProps {
  href: string
}

const { href } = defineProps<ProseAProps>()
</script>
