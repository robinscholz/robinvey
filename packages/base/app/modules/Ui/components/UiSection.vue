<template>
  <section :aria-labelledby="headingId" class="max-w-[64ch] pb-12">
    <h2 :id="headingId" class="mb-[0.5lh]">{{ label }}</h2>
    <slot />
  </section>
</template>

<script setup lang="ts">
interface UiSectionProps {
  label: string
}

const { label } = defineProps<UiSectionProps>()

const headingId = useId()
</script>
