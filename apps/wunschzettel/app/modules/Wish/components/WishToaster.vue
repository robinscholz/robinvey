<template>
  <ClientOnly>
    <MagicToastProvider
      :id="ToastIds.Wish"
      :options="options"
      class="[--magic-toast-padding-x:--spacing(6)] [--magic-toast-padding-y:--spacing(5.5)] motion-reduce:[--magic-toast-animation-duration:0ms] md:[--magic-toast-padding-x:--spacing(12)] md:[--magic-toast-padding-y:--spacing(9.5)] xl:[--magic-toast-padding-x:--spacing(20)]"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { ToastIds, WishDrawerSelector } from '../utils/enums'
import type { MagicToastOptions } from '@maas/vue-equipment/plugins/MagicToast'

const { id } = useWishEditor()

// An open modal dialog keeps the rest of the page below it and inert, so the
// toasts move into the drawer while it is open. They line up with the page
// edge and sit centred on the header line.
const options = computed<MagicToastOptions>(() => ({
  position: 'top-right',
  layout: { expand: false },
  initial: { expanded: true },
  teleport: { target: id.value === null ? 'body' : WishDrawerSelector },
}))
</script>
