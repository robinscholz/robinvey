<template>
  <footer>
    <ui-section label="Colophon">
      <!-- The update note has a line of its own, and never splits. -->
      <p>
        {{ colophon }}<br />
        <span class="whitespace-nowrap">Updated {{ updated }}.</span>
      </p>
      <div class="mt-[1lh]">
        <ui-color-mode-switch variant="button" />
      </div>
    </ui-section>
  </footer>
</template>

<script setup lang="ts">
interface ProfileColophonProps {
  colophon: string
  updated: string
}

const { colophon, updated } = defineProps<ProfileColophonProps>()
</script>
