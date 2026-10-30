<template>
  <footer>
    <UiSection label="Colophon">
      <p>{{ colophon }} Updated {{ updated }}.</p>
      <div class="mt-[1lh]">
        <UiColorModeSwitch variant="button" />
      </div>
    </UiSection>
  </footer>
</template>

<script setup lang="ts">
interface ProfileColophonProps {
  colophon: string
  updated: string
}

const { colophon, updated } = defineProps<ProfileColophonProps>()
</script>
