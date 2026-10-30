<template>
  <div
    ref="area"
    class="relative overflow-hidden select-none"
    aria-hidden="true"
    @wheel.prevent="pan"
    @pointermove="point"
    @pointerleave="hovered = undefined"
  >
    <div
      class="absolute top-0 left-0 will-change-transform"
      :style="{ transform: `translate(${offset.x}px, ${offset.y}px)` }"
    >
      <GardenCell
        v-for="cell in cells"
        :key="cell.key"
        :symbol="cell.symbol"
        :dots="DOTS"
        :size="SIZE"
        :sample="samples.get(cell.symbol)"
        :active="cell.key === hovered"
        :style="{
          transform: `translate(${cell.col * PITCH}px, ${cell.row * PITCH}px)`,
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  useElementSize,
  usePreferredReducedMotion,
  useRafFn,
} from '@vueuse/core'
import { useGardenSamples } from '../composables/private/useGardenSamples'
import { listEmoji } from '../utils/emoji'
import { hashCell } from '../utils/hash'

interface GardenFieldProps {
  // The field drifts only while it is in view.
  active: boolean
}

interface Cell {
  key: string
  col: number
  row: number
  symbol: string
}

// Twelve dots in a 48px matrix, one every 80px.
const DOTS = 12
const SIZE = 48
const PITCH = 80

// Pixels a second the field drifts, up and to the left.
const DRIFT = { x: -6, y: -4 }

const { active } = defineProps<GardenFieldProps>()

// A field for each visit.
const seed = Math.floor(Math.random() * 2 ** 32)

const areaRef = useTemplateRef('area')
const { width, height } = useElementSize(areaRef)
const motion = usePreferredReducedMotion()
const { samples, request } = useGardenSamples(DOTS)

// Listed once the component is up, so the server renders an empty field.
const emoji = shallowRef<Array<string>>([])
const offset = shallowReactive({ x: 0, y: 0 })
const hovered = shallowRef<string>()

// The cells in view, with one more all round, so none pops in at the edge.
// Each bound is a number of its own, so the cells are listed again only
// when the field has drifted a whole cell.
const colFrom = computed(() => Math.floor(-offset.x / PITCH) - 1)
const colTo = computed(() => Math.ceil((width.value - offset.x) / PITCH))
const rowFrom = computed(() => Math.floor(-offset.y / PITCH) - 1)
const rowTo = computed(() => Math.ceil((height.value - offset.y) / PITCH))

const cells = computed<Array<Cell>>(() => {
  const list = emoji.value
  if (list.length === 0 || width.value === 0) {
    return []
  }
  const result: Array<Cell> = []
  for (let row = rowFrom.value; row <= rowTo.value; row++) {
    for (let col = colFrom.value; col <= colTo.value; col++) {
      const symbol = list[hashCell({ col, row, seed }) % list.length]
      if (symbol) {
        result.push({ key: `${col}:${row}`, col, row, symbol })
      }
    }
  }
  return result
})

const { pause, resume } = useRafFn(
  ({ delta }) => {
    offset.x += (DRIFT.x * delta) / 1000
    offset.y += (DRIFT.y * delta) / 1000
  },
  { immediate: false }
)

function pan(event: WheelEvent) {
  offset.x -= event.deltaX
  offset.y -= event.deltaY
}

function point(event: PointerEvent) {
  const rect = areaRef.value?.getBoundingClientRect()
  if (!rect) {
    return
  }
  const col = Math.floor((event.clientX - rect.left - offset.x) / PITCH)
  const row = Math.floor((event.clientY - rect.top - offset.y) / PITCH)
  hovered.value = `${col}:${row}`
}

watch(cells, (list) => request(list.map((cell) => cell.symbol)), {
  immediate: true,
})

watch(
  () => active && motion.value !== 'reduce',
  (drifting) => {
    if (drifting) {
      resume()
    } else {
      pause()
    }
  },
  { immediate: true }
)

onMounted(() => {
  emoji.value = listEmoji()
})
</script>
