<template>
  <li class="group relative">
    <!-- The card’s padding is pulled back, so picture and title line up with
         the page while the focus ring has room around them. -->
    <a
      :href="wish.url"
      target="_blank"
      rel="noreferrer"
      class="rounded-component-sm focus-visible:focus-shadow -m-3 block p-3 outline-hidden"
    >
      <div class="aspect-square">
        <MagicImage
          v-if="wish.image"
          :src="wish.image"
          :provider="preview ? 'none' : undefined"
          :modifiers="modifiers"
          alt=""
          class="block h-full w-full object-contain transition-[scale] duration-250 ease-out motion-safe:group-hover:scale-102"
        />
      </div>
      <p class="mt-5">{{ wish.title }}</p>
      <p v-if="wish.caption" class="text-surface-muted">{{ wish.caption }}</p>
      <p v-if="wish.note" class="text-surface-muted">{{ wish.note }}</p>
    </a>
    <div
      v-if="$slots.actions"
      class="absolute -top-1.5 -right-1.5 opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
    >
      <slot name="actions" />
    </div>
  </li>
</template>

<script setup lang="ts">
interface WishCardProps {
  wish: Wish
  // A draft shows the shop’s own picture, which the transformer cannot reach.
  preview?: boolean
}

const { wish, preview = false } = defineProps<WishCardProps>()

// Cloudflare cuts the product out of the shop’s backdrop; `segment` is its
// own option, beyond the modifiers Nuxt Image names. A picture that comes
// cut out keeps its own edges: the cut would redraw them from the colours
// under its transparent pixels.
const modifiers = computed(() => {
  if (preview) {
    return undefined
  }
  if (wish.imageTransparent) {
    return { format: 'auto' }
  }
  return { format: 'auto', segment: 'foreground' }
})

defineSlots<{
  actions?: () => unknown
}>()
</script>
