<template>
  {{ entry.company
  }}<span v-if="entry.role" class="text-surface-muted">, {{ entry.role }}</span>
</template>

<script setup lang="ts">
interface ProfileExperienceTitleProps {
  entry: Experience
}

const { entry } = defineProps<ProfileExperienceTitleProps>()
</script>
