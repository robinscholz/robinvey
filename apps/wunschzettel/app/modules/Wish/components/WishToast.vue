<template>
  <div
    :role="tone === 'danger' ? 'alert' : 'status'"
    class="bg-surface-low rounded-component-sm shadow-component-high max-w-xs px-4 py-2.5"
    @click="emit('remove')"
  >
    <p :class="TONES[tone]">{{ message }}</p>
    <p v-if="reason" class="text-surface-muted">{{ reason }}</p>
  </div>
</template>

<script setup lang="ts">
interface WishToastProps {
  message: string
  tone: 'success' | 'danger'
  reason?: string
}

const TONES = {
  success: 'text-success-solid',
  danger: 'text-danger-solid',
}

const { message, tone, reason = '' } = defineProps<WishToastProps>()

// A tap dismisses the toast, as a drag does.
const emit = defineEmits<{ remove: [] }>()
</script>
