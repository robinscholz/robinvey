<template>
  <UiMarquee :playing="playing"
    >{{ entry.company
    }}<span v-if="entry.role" class="text-surface-muted"
      >, {{ entry.role }}</span
    ></UiMarquee
  >
</template>

<script setup lang="ts">
interface ProfileExperienceTitleProps {
  entry: Experience
  playing?: boolean
}

const { entry, playing = false } = defineProps<ProfileExperienceTitleProps>()
</script>
