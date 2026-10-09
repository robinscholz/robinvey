<template>
  <footer>
    <UiSection label="Colophon" emoji="🖋️" :reel="REEL" :rule="rule">
      <p class="text-surface-muted">{{ colophon }} Updated {{ updated }}.</p>
      <div class="mt-[1lh] lg:hidden">
        <UiColorModeSwitch />
      </div>
    </UiSection>
  </footer>
</template>

<script setup lang="ts">
interface ProfileColophonProps {
  colophon: string
  updated: string
  rule: number
}

// Spun past by the emoji before it lands.
const REEL = ['✒️', '🔤', '🔠', '🖨️', '📰', '🗞️', '📏', '🎨']

const { colophon, updated, rule } = defineProps<ProfileColophonProps>()
</script>
