<template>
  <div
    ref="area"
    class="relative overflow-hidden select-none"
    aria-hidden="true"
    @wheel.prevent="pan"
    @pointermove="point"
    @pointerleave="pointer = undefined"
  >
    <canvas ref="canvas" class="absolute inset-0 size-full" />
    <!-- The cell under the pointer plays its emoji’s motion on a matrix of
         its own, over its still. -->
    <UiEmoji
      v-if="hovered"
      :key="hovered.key"
      :symbol="hovered.symbol"
      :dots="DOTS"
      class="absolute top-0 left-0"
      :style="{
        width: `${SIZE}px`,
        height: `${SIZE}px`,
        transform: `translate(${hovered.col * PITCH + offset.x}px, ${hovered.row * PITCH + offset.y}px)`,
      }"
      loop
    />
  </div>
</template>

<script setup lang="ts">
import {
  refDebounced,
  useDevicePixelRatio,
  useElementSize,
  usePreferredReducedMotion,
  useRafFn,
} from '@vueuse/core'
import { useGardenTiles } from '../composables/private/useGardenTiles'
import { listEmoji } from '../utils/emoji'
import { hashCell } from '../utils/hash'
import { drawTile } from '../utils/tile'

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

// How long the pointer rests on a cell before the cell plays, so sweeping
// across the field does not draw every emoji it crosses.
const REST = 150

const { active } = defineProps<GardenFieldProps>()

// A field for each visit.
const seed = Math.floor(Math.random() * 2 ** 32)

const areaRef = useTemplateRef('area')
const canvasRef = useTemplateRef('canvas')
const { width, height } = useElementSize(areaRef)
const { pixelRatio } = useDevicePixelRatio()
const motion = usePreferredReducedMotion()

// Listed once the component is up, so the server renders an empty field.
const emoji = shallowRef<Array<string>>([])
const offset = shallowReactive({ x: 0, y: 0 })
const pointer = shallowRef<Cell>()
const hovered = refDebounced(pointer, REST)

// The colour of an unlit dot, read from the garden’s own tokens.
const inactive = shallowRef('')

// A tile with no emoji on it, for cells whose tile is not drawn yet.
let blank: HTMLCanvasElement | undefined

const { tiles, request } = useGardenTiles((symbol) =>
  drawTile({
    symbol,
    dots: DOTS,
    size: SIZE,
    scale: pixelRatio.value,
    inactive: inactive.value,
  })
)

// The cells in view, with one more all round, so none pops in at the edge.
// Each bound is a number of its own, so the cells are listed again only
// when the field has drifted a whole cell.
const colFrom = computed(() => Math.floor(-offset.x / PITCH) - 1)
const colTo = computed(() => Math.ceil((width.value - offset.x) / PITCH))
const rowFrom = computed(() => Math.floor(-offset.y / PITCH) - 1)
const rowTo = computed(() => Math.ceil((height.value - offset.y) / PITCH))

const cells = computed<Array<Cell>>(() => {
  if (emoji.value.length === 0 || width.value === 0) {
    return []
  }
  const result: Array<Cell> = []
  for (let row = rowFrom.value; row <= rowTo.value; row++) {
    for (let col = colFrom.value; col <= colTo.value; col++) {
      const cell = cellAt({ col, row })
      if (cell) {
        result.push(cell)
      }
    }
  }
  return result
})

function cellAt({ col, row }: Pick<Cell, 'col' | 'row'>): Cell | undefined {
  const list = emoji.value
  const symbol = list[hashCell({ col, row, seed }) % list.length]
  return symbol ? { key: `${col}:${row}`, col, row, symbol } : undefined
}

// Every cell in view, from its tile or a blank one until it is drawn. The
// canvas is sized to the area in device pixels, and drawn in CSS pixels.
function draw() {
  const canvas = canvasRef.value
  const context = canvas?.getContext('2d')
  if (!canvas || !context) {
    return
  }
  const scale = pixelRatio.value
  const pixelWidth = Math.round(width.value * scale)
  const pixelHeight = Math.round(height.value * scale)
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth
    canvas.height = pixelHeight
  }
  blank ??= drawTile({
    dots: DOTS,
    size: SIZE,
    scale,
    inactive: inactive.value,
  })
  context.setTransform(scale, 0, 0, scale, 0, 0)
  context.clearRect(0, 0, width.value, height.value)
  for (const cell of cells.value) {
    const tile = tiles.get(cell.symbol) ?? blank
    if (tile) {
      context.drawImage(
        tile,
        cell.col * PITCH + offset.x,
        cell.row * PITCH + offset.y,
        SIZE,
        SIZE
      )
    }
  }
}

const { pause, resume } = useRafFn(
  ({ delta }) => {
    if (motion.value !== 'reduce') {
      offset.x += (DRIFT.x * delta) / 1000
      offset.y += (DRIFT.y * delta) / 1000
    }
    draw()
  },
  { immediate: false }
)

function pan(event: WheelEvent) {
  offset.x -= event.deltaX
  offset.y -= event.deltaY
}

// The cell under the pointer, if the pointer is on its matrix rather than
// in the gap beside it.
function point(event: PointerEvent) {
  const rect = areaRef.value?.getBoundingClientRect()
  if (!rect) {
    return
  }
  const x = event.clientX - rect.left - offset.x
  const y = event.clientY - rect.top - offset.y
  const col = Math.floor(x / PITCH)
  const row = Math.floor(y / PITCH)
  const within = x - col * PITCH < SIZE && y - row * PITCH < SIZE
  const cell = within ? cellAt({ col, row }) : undefined
  if (cell?.key !== pointer.value?.key) {
    pointer.value = cell
  }
}

watch(cells, (list) => request(list.map((cell) => cell.symbol)), {
  immediate: true,
})

watch(
  () => active,
  (showing) => {
    if (showing) {
      resume()
    } else {
      pause()
    }
  },
  { immediate: true }
)

onMounted(() => {
  const area = areaRef.value
  if (area) {
    inactive.value = getComputedStyle(area).getPropertyValue(
      '--app-color-surface-fg-subtle'
    )
  }
  emoji.value = listEmoji()
})
</script>
