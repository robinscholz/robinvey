<template>
  <m-alert-dialog-root
    v-model:open="open"
    :options="{
      keyListener: { close: false },
      scrollLock: false,
      transition: { content: 'wish-alert', backdrop: 'wish-alert-backdrop' },
    }"
  >
    <m-alert-dialog-backdrop
      class="fixed inset-0 bg-[color-mix(in_oklab,var(--mirror-bg-surface-low)_70%,transparent)]"
    />
    <m-alert-dialog-content
      :final-focus="finalFocus"
      class="bg-surface-low rounded-component-sm shadow-component-high fixed inset-x-6 top-1/2 mx-auto max-w-xs -translate-y-1/2 p-6 outline-hidden"
    >
      <m-alert-dialog-title
        >Remove {{ title || 'this wish' }}?</m-alert-dialog-title
      >
      <p class="mt-8 flex justify-end gap-x-8">
        <wish-button @click="open = false">Cancel</wish-button>
        <wish-button variant="danger" @click="confirm">Remove</wish-button>
      </p>
    </m-alert-dialog-content>
  </m-alert-dialog-root>
</template>

<script setup lang="ts">
import type { AlertDialogFocusTarget } from '@maas/mirror/vue/AlertDialog'

// Escape is left to the caller: inside the drawer, the native dialog answers
// it and closes this alert first. The page is not locked for the alert: the
// drawer under it already holds the page still, and the list is short. The
// transitions are in main.css.
interface WishRemoveDialogProps {
  title: string
  finalFocus?: AlertDialogFocusTarget
}

const { title, finalFocus = null } = defineProps<WishRemoveDialogProps>()

const emit = defineEmits<{
  confirm: []
}>()

const open = defineModel<boolean>('open', { required: true })

function confirm() {
  open.value = false
  emit('confirm')
}
</script>
