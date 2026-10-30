<template>
  <ui-marquee :playing="playing"
    >{{ entry.company
    }}<template v-if="entry.role">, {{ entry.role }}</template></ui-marquee
  >
</template>

<script setup lang="ts">
interface ProfileExperienceTitleProps {
  entry: Experience
  playing?: boolean
}

const { entry, playing = false } = defineProps<ProfileExperienceTitleProps>()
</script>
