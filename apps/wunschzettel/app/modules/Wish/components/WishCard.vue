<template>
  <li>
    <a :href="wish.url" target="_blank" rel="noreferrer" class="group block">
      <div class="aspect-square">
        <MagicImage
          v-if="wish.image"
          :src="wish.image"
          :provider="preview ? 'none' : undefined"
          :modifiers="preview ? undefined : MODIFIERS"
          alt=""
          class="block h-full w-full object-contain transition-opacity duration-300 group-hover:opacity-75"
        />
      </div>
      <p class="mt-5">{{ wish.title }}</p>
      <p v-if="wish.caption" class="text-muted">{{ wish.caption }}</p>
      <p v-if="wish.note" class="text-muted">{{ wish.note }}</p>
    </a>
  </li>
</template>

<script setup lang="ts">
interface WishCardProps {
  wish: Wish
  // A draft shows the shop’s own picture, which the transformer cannot reach.
  preview?: boolean
}

// Cloudflare cuts the product out of the shop’s backdrop; `segment` is its
// own option, beyond the modifiers Nuxt Image names.
const MODIFIERS = { format: 'auto', segment: 'foreground' }

const { wish, preview = false } = defineProps<WishCardProps>()
</script>
