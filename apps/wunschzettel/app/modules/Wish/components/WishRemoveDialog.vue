<template>
  <MAlertDialogRoot
    v-model:open="open"
    :options="{
      keyListener: { close: false },
      scrollLock: false,
      transition: { content: 'wish-alert', backdrop: 'wish-alert-backdrop' },
    }"
  >
    <MAlertDialogBackdrop
      class="fixed inset-0 bg-[color-mix(in_oklab,var(--mirror-bg-surface-low)_70%,transparent)]"
    />
    <MAlertDialogContent
      :final-focus="finalFocus"
      class="bg-surface-low rounded-component-sm shadow-component-high fixed inset-x-6 top-1/2 mx-auto max-w-xs -translate-y-1/2 p-6 outline-hidden"
    >
      <MAlertDialogTitle>Remove {{ title || 'this wish' }}?</MAlertDialogTitle>
      <p class="mt-8 flex justify-end gap-x-8">
        <WishButton @click="open = false">Cancel</WishButton>
        <WishButton variant="danger" @click="confirm">Remove</WishButton>
      </p>
    </MAlertDialogContent>
  </MAlertDialogRoot>
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
