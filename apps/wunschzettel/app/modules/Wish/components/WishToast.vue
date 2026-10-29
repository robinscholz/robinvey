<template>
  <div
    :role="tone === 'danger' ? 'alert' : 'status'"
    class="bg-surface-base text-surface rounded-component-sm flex w-72 max-w-[calc(100vw-2*var(--magic-toast-padding-x))] gap-3 px-4 py-3.5 shadow-sm"
    @click="emit('remove')"
  >
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="1.25"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class="text-surface-muted mt-0.5 size-4 shrink-0"
    >
      <circle cx="8" cy="8" r="6.5" />
      <path v-if="tone === 'success'" d="m5.25 8.25 1.75 1.75 3.75-4" />
      <template v-else>
        <path d="M8 4.75v3.75" />
        <circle cx="8" cy="11" r="0.25" fill="currentColor" />
      </template>
    </svg>
    <div class="space-y-0.5">
      <p>{{ message }}</p>
      <p v-if="reason" class="text-surface-muted">{{ reason }}</p>
    </div>
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
