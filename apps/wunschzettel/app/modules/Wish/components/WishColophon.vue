<template>
  <footer>
    <UiSection label="Absender" :rule="rule">
      <p class="text-surface-muted">
        <UiLink to="https://robinvey.com">Robin Vey</UiLink>. Stand
        {{ updated }}.
      </p>
      <div class="mt-[1lh] lg:hidden">
        <UiColorModeSwitch variant="button" />
      </div>
    </UiSection>
  </footer>
</template>

<script setup lang="ts">
interface WishColophonProps {
  updated: string
  rule: number
}

const { updated, rule } = defineProps<WishColophonProps>()
</script>
