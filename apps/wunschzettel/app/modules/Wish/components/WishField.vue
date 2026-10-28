<template>
  <label class="flex items-baseline gap-x-[1.5ch] md:gap-x-[2ch]">
    <span class="text-surface-muted w-[10ch] shrink-0">{{ label }}</span>
    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      class="border-surface placeholder:text-surface-subtle min-w-0 flex-1 border-b bg-transparent focus:border-current focus:outline-none"
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
