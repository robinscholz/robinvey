<template>
  <!-- Always dark, whatever the page’s colour mode: the attribute scopes the
       dark tokens and the font’s dark axis to the garden. -->
  <div
    ref="area"
    class="bg-surface-low invisible fixed inset-0 z-0 overflow-hidden select-none data-revealed:visible"
    aria-hidden="true"
    data-color-mode="dark"
    :data-revealed="revealed || null"
    @pointermove="brush"
    @pointerleave="release"
    @click="close"
  >
    <div
      ref="text"
      class="absolute bottom-0 left-1/2 -translate-x-1/2 font-mono leading-[1.2] font-medium tracking-normal [--axis-mono:100] [font-kerning:none] [font-variant-ligatures:none] [word-spacing:normal]"
    >
      <div v-for="(line, row) in lines" :key="row" class="whitespace-pre">
        <span
          v-for="(run, column) in line"
          :key="column"
          :class="{ 'text-(--garden-hue)': run.hue }"
          :style="run.hue ? { '--garden-hue': color(run.hue) } : undefined"
          v-text="run.text"
        />
      </div>
    </div>
    <!-- The page’s shadow, cast by an empty box over the part of the page in
         view. The page clips itself, which would cut off its own shadow. -->
    <div
      class="shadow-component pointer-events-none absolute inset-y-0 right-(--garden-page-right) left-(--garden-page-left) opacity-0 transition-opacity duration-150 ease-out data-settled:opacity-100 data-settled:duration-300"
      :data-settled="settled || null"
      :style="{
        '--garden-page-left': `${insets.left}px`,
        '--garden-page-right': `${insets.right}px`,
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { useGardenTray } from '../composables/private/useGardenTray'
import { useGardenGrid } from '../composables/private/useGardenGrid'
import { useGardenWind } from '../composables/private/useGardenWind'
import { compose } from '../utils/compose'
import { grow } from '../utils/grow'
import { render } from '../utils/render'
import type { Garden } from '../utils/grow'

// A garden for each visit. It stays the same through a resize, which only
// regrows it to the new size.
const seed = Math.floor(Math.random() * 2 ** 32)

// Leans per second a plant takes for every column the pointer sweeps across
// it.
const BRUSH = 0.8

const areaRef = useTemplateRef('area')
const textRef = useTemplateRef('text')

const garden = shallowRef<Garden>()

const { revealed, settled, insets, close } = useGardenTray()
const { color } = useHue()
const { cell, cols, rows, aspect, measure } = useGardenGrid({
  area: areaRef,
  text: textRef,
})
const { leans, nudge } = useGardenWind({ garden, active: revealed })

// Where the pointer was, so a sweep pushes what it crosses.
let pointer: number | undefined

const frame = computed(() =>
  garden.value
    ? compose({ garden: garden.value, leans: leans.value })
    : undefined
)

const lines = computed(() => (frame.value ? render(frame.value) : []))

function plantAt(event: PointerEvent): number {
  const element = textRef.value
  const current = frame.value
  if (!element || !current || !cell.value.width) {
    return 0
  }
  const rect = element.getBoundingClientRect()
  const col = Math.floor((event.clientX - rect.left) / cell.value.width)
  const row = Math.floor((event.clientY - rect.top) / cell.value.height)
  if (col < 0 || row < 0 || col >= current.cols || row >= current.rows) {
    return 0
  }
  return current.plants[row * current.cols + col] ?? 0
}

function brush(event: PointerEvent) {
  const plant = plantAt(event)
  if (plant && pointer !== undefined && cell.value.width) {
    const sweep = (event.clientX - pointer) / cell.value.width
    nudge({ plant, force: sweep * BRUSH })
  }
  pointer = event.clientX
}

function release() {
  pointer = undefined
}

watch([cols, rows], ([nextCols, nextRows]) => {
  if (nextCols && nextRows) {
    garden.value = grow({
      cols: nextCols,
      rows: nextRows,
      aspect: aspect.value,
      seed,
    })
  }
})

onMounted(async () => {
  await document.fonts.ready
  measure()
})
</script>
