<template>
  <nuxt-icon :name="icon" class="inline-block align-[-0.2em]" />
</template>

<script setup lang="ts">
interface UiIconProps {
  name: string
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
  prefix?: string
}

const { name, weight = 300, prefix = 'maas' } = defineProps<UiIconProps>()

const icon = computed(() => `${prefix}:${name}-${weight}`)
</script>
