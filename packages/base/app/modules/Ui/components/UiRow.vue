<template>
  <component
    :is="as"
    :class="[
      'flex items-baseline gap-x-[1.5ch] md:gap-x-[2ch]',
      {
        'group hover:**:text-(--ui-hue) data-pinned:**:text-(--ui-hue)':
          interactive,
      },
    ]"
    :style="hue > 0 ? { '--ui-hue': color(hue) } : undefined"
    :data-pinned="hue > 0 || undefined"
    :data-hue="interactive || null"
    @pointerenter="interactive && advance()"
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
  hue?: number
}

const { as = 'span', interactive = true, hue = 0 } = defineProps<UiRowProps>()

const { advance, color } = useHue()
</script>
