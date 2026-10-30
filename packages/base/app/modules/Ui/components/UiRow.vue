<template>
  <component
    :is="as"
    :class="[
      'flex items-baseline gap-x-[1.5ch] md:gap-x-[2ch]',
      { group: interactive },
    ]"
  >
    <span
      class="text-surface-muted w-[10ch] shrink-0 whitespace-nowrap tabular-nums"
    >
      <slot name="meta" />
    </span>
    <!-- The title underlines under the pointer, the way a link in the prose
         is underlined; the dates beside it stay as they are. -->
    <component
      :is="as"
      class="min-w-0 flex-1 decoration-1 underline-offset-[0.2em] group-hover:underline"
    >
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
