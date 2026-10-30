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
import { useEmojiCanvasTiles } from '../composables/private/useEmojiCanvasTiles'
import { listEmoji } from '../utils/emoji'
import { hashCell } from '../utils/hash'
import { shuffle } from '../utils/shuffle'
import { drawGrid, drawTile, drawable } from '../utils/tile'

interface EmojiCanvasProps {
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

const { active } = defineProps<EmojiCanvasProps>()

// A field for each visit.
const seed = Math.floor(Math.random() * 2 ** 32)

const areaRef = useTemplateRef('area')
const canvasRef = useTemplateRef('canvas')
const { width, height } = useElementSize(areaRef)
const { pixelRatio } = useDevicePixelRatio()
const motion = usePreferredReducedMotion()

// Listed once the component is up, less the emoji the system cannot draw,
// so the server renders an empty field.
const emoji = shallowRef<Array<string>>([])

// The field is tiled with blocks that each hold every emoji once, in an
// order of their own, so no emoji repeats within a block and a repeat across
// a seam is rare. A block is about square, and the few cells it has over are
// filled from the start of its order, at its far corner.
const blockCols = computed(() => Math.ceil(Math.sqrt(emoji.value.length)))
const blockRows = computed(() =>
  blockCols.value ? Math.ceil(emoji.value.length / blockCols.value) : 0
)
const blocks = new Map<string, Array<string>>()
const offset = shallowReactive({ x: 0, y: 0 })
const pointer = shallowRef<Cell>()
const hovered = refDebounced(pointer, REST)

// The unlit dots every cell shares, in the colour the page’s tokens give
// them, which follows the colour mode. The tiles hold lit dots only, so
// they outlast a change of mode.
const colorMode = useColorMode()
const inactive = shallowRef('')
let grid: HTMLCanvasElement | undefined

const { tiles, request } = useEmojiCanvasTiles((symbol) =>
  drawTile({ symbol, dots: DOTS, size: SIZE, scale: pixelRatio.value })
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

// A block’s order, drawn from its place and the visit’s seed. Far travels
// would pile orders up, so the cache starts over now and then.
function blockAt(blockCol: number, blockRow: number): Array<string> {
  const key = `${blockCol}:${blockRow}`
  const known = blocks.get(key)
  if (known) {
    return known
  }
  if (blocks.size > 32) {
    blocks.clear()
  }
  const order = shuffle(
    emoji.value,
    hashCell({ col: blockCol, row: blockRow, seed })
  )
  blocks.set(key, order)
  return order
}

function cellAt({ col, row }: Pick<Cell, 'col' | 'row'>): Cell | undefined {
  const list = emoji.value
  if (list.length === 0) {
    return undefined
  }
  const blockCol = Math.floor(col / blockCols.value)
  const blockRow = Math.floor(row / blockRows.value)
  const index =
    (row - blockRow * blockRows.value) * blockCols.value +
    (col - blockCol * blockCols.value)
  const symbol = blockAt(blockCol, blockRow)[index % list.length]
  return symbol ? { key: `${col}:${row}`, col, row, symbol } : undefined
}

// Every cell in view: the grid, and the tile over it once it is drawn. The
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
  grid ??= drawGrid({
    dots: DOTS,
    size: SIZE,
    scale,
    inactive: inactive.value,
  })
  context.setTransform(scale, 0, 0, scale, 0, 0)
  context.clearRect(0, 0, width.value, height.value)
  for (const cell of cells.value) {
    const x = cell.col * PITCH + offset.x
    const y = cell.row * PITCH + offset.y
    if (grid) {
      context.drawImage(grid, x, y, SIZE, SIZE)
    }
    const tile = tiles.get(cell.symbol)
    if (tile) {
      context.drawImage(tile, x, y, SIZE, SIZE)
    }
  }
}

function readInactive() {
  const area = areaRef.value
  if (!area) {
    return
  }
  inactive.value = getComputedStyle(area).getPropertyValue(
    '--app-color-surface-fg-subtle'
  )
  grid = undefined
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

// The mode is written to <html> in the same tick, so the tokens are read
// once that has settled.
watch(
  () => colorMode.value,
  () => nextTick(readInactive)
)

onMounted(() => {
  readInactive()
  emoji.value = drawable(listEmoji())
})
</script>
