<template>
  <nuxt-icon :name="icon" class="inline-block align-[-0.2em]" />
</template>

<script setup lang="ts">
import { iconName } from '../utils/icon'
import type { IconWeight } from '../utils/icon'

interface UiIconProps {
  name: string
  weight?: IconWeight
  prefix?: string
}

const { name, weight, prefix } = defineProps<UiIconProps>()

const icon = computed(() => iconName({ name, weight, prefix }))
</script>
