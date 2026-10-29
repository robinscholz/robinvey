<template>
  <div
    :role="tone === 'danger' ? 'alert' : 'status'"
    class="bg-primary-solid text-primary-on-solid rounded-component-sm max-w-xs px-4 py-2.5 shadow-lg"
    @click="emit('remove')"
  >
    <p>{{ message }}</p>
    <p v-if="reason" class="opacity-70">{{ reason }}</p>
  </div>
</template>

<script setup lang="ts">
interface WishToastProps {
  message: string
  tone: 'success' | 'danger'
  reason?: string
}

const { message, tone, reason = '' } = defineProps<WishToastProps>()

// A tap dismisses the toast, as a drag does.
const emit = defineEmits<{ remove: [] }>()
</script>
