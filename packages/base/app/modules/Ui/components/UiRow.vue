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
    <span
      class="text-surface-muted w-[1em] shrink-0 transition-[opacity,color] duration-150 ease-out group-hover:duration-0 data-pending:opacity-0 data-pending:transition-none"
      :class="{ 'max-md:hidden': !$slots.mark }"
      aria-hidden="true"
      :data-pending="pending || null"
    >
      <slot name="mark" />
    </span>
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
const { on, off } = useUiEmitter()

// The mark waits out the intro, then fades in once the text has settled.
const pending = shallowRef(false)

function hold() {
  pending.value = true
}

function release() {
  pending.value = false
}

on('beforeIntro', hold)
on('afterIntro', release)

onScopeDispose(() => {
  off('beforeIntro', hold)
  off('afterIntro', release)
})
</script>
