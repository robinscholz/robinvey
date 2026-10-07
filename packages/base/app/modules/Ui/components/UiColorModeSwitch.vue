<template>
  <ClientOnly>
    <m-radio-group
      :model-value="preference"
      :class="groupClass"
      aria-label="Colour mode"
      :options="{ orientation: 'horizontal' }"
      @update:model-value="select"
    >
      <m-radio-root
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :class="itemClass"
        @pointerenter="advance"
      >
        {{ option.label }}
      </m-radio-root>
    </m-radio-group>
    <template #fallback>
      <span :class="groupClass" aria-hidden="true">
        <span v-for="option in options" :key="option.value" :class="itemClass">
          {{ option.label }}
        </span>
      </span>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
type ColorModePreference = 'system' | 'light' | 'dark'

interface ColorModeOption {
  value: ColorModePreference
  label: string
}

const colorMode = useColorMode()
const { advance } = useHue()

const options: Array<ColorModeOption> = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

const preference = computed<ColorModePreference>(
  () =>
    options.find((entry) => entry.value === colorMode.preference)?.value ??
    'system'
)

const groupClass = 'inline-flex gap-x-4'

const itemClass = [
  'cursor-pointer text-surface-muted underline decoration-1 decoration-transparent underline-offset-[0.2em]',
  'hover:text-(--ui-hue)',
  'data-[checked=true]:text-surface data-[checked=true]:decoration-current',
].join(' ')

function select(value: unknown) {
  const option = options.find((entry) => entry.value === value)
  if (option) {
    colorMode.preference = option.value
  }
}
</script>
