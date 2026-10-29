<template>
  <button
    ref="button"
    type="button"
    class="cursor-pointer underline decoration-1 underline-offset-[0.2em] hover:text-(--ui-hue)"
    :aria-label="`Typeface: ${label}`"
    data-hue
    @pointerenter="advance"
    @click="toggle(buttonRef)"
  >
    {{ label }}
  </button>
</template>

<script setup lang="ts">
const { label, toggle } = useTypeface()
const { advance } = useHue()

const buttonRef = useTemplateRef('button')
</script>
