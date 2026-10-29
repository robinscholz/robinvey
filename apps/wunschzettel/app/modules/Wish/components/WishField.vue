<template>
  <label class="flex items-baseline gap-x-6">
    <span class="text-muted w-[10ch] shrink-0">{{ label }}</span>
    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      class="border-line placeholder:text-muted/50 focus:border-ink min-w-0 flex-1 border-b bg-transparent py-1 focus:outline-none"
      autocomplete="off"
      spellcheck="false"
    />
  </label>
</template>

<script setup lang="ts">
interface WishFieldProps {
  label: string
  type?: 'text' | 'url'
  placeholder?: string
}

const { label, type = 'text', placeholder = '' } = defineProps<WishFieldProps>()

const model = defineModel<string>({ required: true })
</script>
