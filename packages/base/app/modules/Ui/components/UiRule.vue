<template>
  <div
    ref="rule"
    class="text-surface-muted invisible relative h-lh translate-y-(--rule-offset) overflow-hidden leading-[1lh] tracking-(--rule-gap) whitespace-nowrap select-none data-measured:visible"
    aria-hidden="true"
    :data-measured="measured || null"
    :style="spacing"
  >
    <template v-if="scrambling">
      <span
        v-for="(cell, index) in glyphs"
        :key="index"
        class="absolute top-0 left-[calc(var(--rule-cell)*var(--rule-pitch))] flex w-(--rule-advance) justify-center tracking-normal"
        :style="{ '--rule-cell': index }"
        v-text="cell"
      />
    </template>
    <template v-else>{{ line }}</template>
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { scrambleRepeat } from '../utils/scramble'

interface GlyphMetrics {
  ink: number
  offset: number
}

interface GlyphMetricsPayload {
  char: string
  glyph: CSSStyleDeclaration
  text: CSSStyleDeclaration
}

// Rendered on the server and before the font settles: enough to fill any
// width, clipped by overflow. It is only there to be measured, so the rule
// stays hidden until it has been.
const FALLBACK_COUNT = 600

// The visible gap between two glyphs, from ink to ink, in em of the text
// size. Every rule shares it, whatever the glyph’s own side bearings.
const GAP = 0.35

const { glyph: char } = useRule()
const { typeface } = useTypeface()
const { on, off } = useUiEmitter()

const ruleRef = useTemplateRef('rule')
const { width, height } = useElementSize(ruleRef)
const advance = shallowRef(0)
const tracking = shallowRef(0)
const offset = shallowRef(0)

// How far the intro has settled, from 0 to 1; settled unless it plays.
const progress = shallowRef(1)

const measured = computed(() => advance.value > 0 && width.value > 0)

// Whole glyphs with air between them, the first on the left edge and the
// last on the right: n glyphs and n - 1 gaps fill the width.
const count = computed(() =>
  measured.value
    ? Math.max(
        2,
        Math.floor(
          (width.value + tracking.value) / (advance.value + tracking.value)
        )
      )
    : FALLBACK_COUNT
)

const line = computed(() => char.value.repeat(count.value))

// Scrambled with the text while the intro plays. Each glyph then sits in a
// cell as wide as the rule’s own, so stand-ins of any width hold its place.
// Cells are placed one by one, as rounding in a row adds up along the rule.
const scrambling = computed(() => measured.value && progress.value < 1)

const glyphs = computed(() =>
  scrambleRepeat({
    char: char.value,
    count: count.value,
    progress: progress.value,
  })
)

const gap = computed(
  () => (width.value - count.value * advance.value) / (count.value - 1)
)
const pitch = computed(() => advance.value + gap.value)

const spacing = computed(() =>
  measured.value
    ? {
        '--rule-advance': `${advance.value}px`,
        '--rule-gap': `${gap.value}px`,
        '--rule-pitch': `${pitch.value}px`,
        '--rule-offset': `${offset.value}px`,
      }
    : { '--rule-gap': `${GAP}em` }
)

function font(style: CSSStyleDeclaration): string {
  return `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
}

// The ink width sets the spacing, and the ink’s height moves each glyph
// until it centres on the middle of a capital in the surrounding text: an
// asterisk sits near the cap tops, a hyphen at x-height.
function metrics({ char, glyph, text }: GlyphMetricsPayload): GlyphMetrics {
  const context = document.createElement('canvas').getContext('2d')
  if (!context) {
    return { ink: advance.value, offset: 0 }
  }
  context.font = font(text)
  const capital = context.measureText('H')
  context.font = font(glyph)
  const ink = context.measureText(char)
  const capitalMiddle =
    (capital.fontBoundingBoxAscent - capital.fontBoundingBoxDescent) / 2 -
    capital.actualBoundingBoxAscent / 2
  const inkMiddle =
    (ink.fontBoundingBoxAscent - ink.fontBoundingBoxDescent) / 2 -
    (ink.actualBoundingBoxAscent - ink.actualBoundingBoxDescent) / 2
  return {
    ink: ink.actualBoundingBoxLeft + ink.actualBoundingBoxRight,
    offset: capitalMiddle - inkMiddle,
  }
}

// The type steps up a size at a breakpoint, so the glyph is measured again
// from what is on screen whenever the rule’s box changes. Its width can change
// before the type does; it is a line tall, so its height follows the type.
// A new typeface changes the glyph but not the box, so it measures again too.
// Measuring the rendered text keeps kerning and the variable font’s axes in
// the number. Stand-ins would skew it, so a scrambling rule is measured once
// it settles.
function measure() {
  const element = ruleRef.value
  const text = element?.textContent ?? ''
  if (!element || text.length === 0 || scrambling.value) {
    return
  }
  const style = getComputedStyle(element)
  const textStyle = getComputedStyle(element.parentElement ?? element)
  const spread = parseFloat(style.letterSpacing) || 0
  const range = document.createRange()
  range.selectNodeContents(element)
  advance.value = range.getBoundingClientRect().width / text.length - spread

  const glyphMetrics = metrics({
    char: char.value,
    glyph: style,
    text: textStyle,
  })
  tracking.value = Math.max(
    0,
    GAP * parseFloat(textStyle.fontSize) - (advance.value - glyphMetrics.ink)
  )
  offset.value = glyphMetrics.offset
}

// Each report rolls new noise, even when the progress holds still, as it does
// through the hold before a typeface switch.
function settle(value: number) {
  progress.value = value
  triggerRef(progress)
}

on('scrambleProgress', settle)

watch([width, height, char, scrambling, typeface], measure, { flush: 'post' })

onMounted(async () => {
  await document.fonts.ready
  measure()
})

onScopeDispose(() => {
  off('scrambleProgress', settle)
})
</script>
