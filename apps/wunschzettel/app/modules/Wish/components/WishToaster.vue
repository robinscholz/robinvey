<template>
  <client-only>
    <magic-toast-provider
      :id="ToastIds.Wish"
      :options="options"
      class="[--magic-toast-animation-duration:300ms] [--magic-toast-padding-x:--spacing(4)] [--magic-toast-padding-y:--spacing(4)] motion-reduce:[--magic-toast-animation-duration:0ms]"
    />
  </client-only>
</template>

<script setup lang="ts">
import { ToastIds, WishDrawerSelector } from '../utils/enums'
import type { MagicToastOptions } from '@maas/vue-equipment/plugins/MagicToast'

const { id } = useWishEditor()

// An open modal dialog keeps the rest of the page below it and inert, so the
// toasts move into the drawer while it is open. They slide in from the right
// and are swiped back out the same way.
const options = computed<MagicToastOptions>(() => ({
  position: 'top-right',
  transition: 'wish-toast',
  drag: { direction: 'right' },
  layout: { expand: false },
  initial: { expanded: true },
  teleport: { target: id.value === null ? 'body' : WishDrawerSelector },
}))
</script>

<style>
.wish-toast-enter-active {
  animation: wish-toast-in var(--magic-toast-animation-duration) var(--ease-out);
}

.wish-toast-leave-active {
  animation: wish-toast-out var(--magic-toast-animation-duration)
    var(--ease-out);
}

@keyframes wish-toast-in {
  from {
    transform: translate3d(calc(100% + var(--magic-toast-padding-x)), 0, 0);
  }
}

@keyframes wish-toast-out {
  to {
    transform: translate3d(calc(100% + var(--magic-toast-padding-x)), 0, 0);
  }
}
</style>
