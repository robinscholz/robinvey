<template>
  <footer>
    <UiSection label="Colophon">
      <!-- The update note has a line of its own, and never splits. -->
      <p>
        {{ colophon }}<br />
        <span class="whitespace-nowrap">Updated {{ updated }}.</span>
      </p>
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
