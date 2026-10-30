<template>
  <UiMarquee :playing="playing"
    >{{ entry.company
    }}<template v-if="entry.role">, {{ entry.role }}</template></UiMarquee
  >
</template>

<script setup lang="ts">
interface ProfileExperienceTitleProps {
  entry: Experience
  playing?: boolean
}

const { entry, playing = false } = defineProps<ProfileExperienceTitleProps>()
</script>
