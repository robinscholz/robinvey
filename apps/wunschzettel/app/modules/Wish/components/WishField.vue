<template>
  <label class="flex items-baseline gap-x-6">
    <span class="text-surface-muted w-[10ch] shrink-0">{{ label }}</span>
    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      class="field-underline placeholder:text-surface-subtle focus-visible:focus-underline min-w-0 flex-1 bg-transparent py-1 outline-hidden"
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
