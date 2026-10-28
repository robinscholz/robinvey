<template>
  <li>
    <a
      :href="wish.url"
      target="_blank"
      rel="noreferrer"
      class="block hover:**:text-(--ui-hue)"
      @pointerenter="advance"
    >
      <!-- The picture multiplies onto the light paper, so a shop’s white
           backdrop disappears; in dark mode the paper comes along as a
           tile. -->
      <div
        class="aspect-4/5 overflow-hidden dark:bg-(--config-color-palette-stone-solid-1)"
      >
        <MagicImage
          v-if="wish.image"
          :src="wish.image"
          alt=""
          class="block h-full w-full object-contain mix-blend-multiply"
        />
      </div>
      <div class="mt-[0.75lh] flex items-baseline gap-x-[1.5ch]">
        <span class="min-w-0 flex-1">{{ wish.title }}</span>
        <span class="text-surface-muted w-[1em] shrink-0" aria-hidden="true">
          <UiIcon name="arrow-n-e" />
        </span>
      </div>
      <p v-if="wish.caption" class="text-surface-muted">{{ wish.caption }}</p>
      <p v-if="wish.note" class="text-surface-muted">{{ wish.note }}</p>
    </a>
  </li>
</template>

<script setup lang="ts">
interface WishCardProps {
  wish: Wish
}

const { wish } = defineProps<WishCardProps>()

const { advance } = useHue()
</script>
