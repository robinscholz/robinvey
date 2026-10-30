<template>
  <div
    class="absolute top-0 left-0"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <UiEmoji
      v-if="active"
      :symbol="symbol"
      :dots="dots"
      class="size-full"
      loop
    />
    <magic-dot-matrix
      v-else
      :id="id"
      class="dot-matrix"
      :sequence="sequence"
      :options="options"
      :style="colors"
    />
  </div>
</template>

<script setup lang="ts">
import type { EmojiSample } from '../utils/sample'

interface GardenCellProps {
  symbol: string
  dots: number
  size: number
  // The still, once drawn; null for an emoji the system cannot draw.
  sample?: EmojiSample | null
  // The cell under the pointer plays its emoji’s motion instead.
  active?: boolean
}

const {
  symbol,
  dots,
  size,
  sample,
  active = false,
} = defineProps<GardenCellProps>()

const id = useId()

const sequence = computed(() => (sample ? [sample.layers] : []))

const options = computed(() => ({ cols: dots, rows: dots, autoplay: false }))

const colors = computed(() =>
  Object.fromEntries(
    (sample?.colors ?? []).map((color, index) => [
      `--magic-dot-matrix-color-${index + 1}`,
      color,
    ])
  )
)
</script>
