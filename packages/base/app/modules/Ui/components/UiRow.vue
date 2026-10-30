<template>
  <component
    :is="as"
    :class="[
      'flex items-baseline gap-x-[1.5ch] md:gap-x-[2ch]',
      { 'hover:text-surface-muted': interactive },
    ]"
  >
    <span
      class="text-surface-muted w-[10ch] shrink-0 whitespace-nowrap tabular-nums"
    >
      <slot name="meta" />
    </span>
    <component :is="as" class="min-w-0 flex-1">
      <slot />
    </component>
  </component>
</template>

<script setup lang="ts">
interface UiRowProps {
  as?: 'span' | 'div'
  interactive?: boolean
}

const { as = 'span', interactive = true } = defineProps<UiRowProps>()
</script>
