<template>
  <li class="group relative">
    <!-- The card’s padding is pulled back, so picture and title line up with
         the page while the focus ring has room around them. -->
    <a
      ref="link"
      :href="wish.url"
      target="_blank"
      rel="noreferrer"
      :class="[
        'rounded-component-sm focus-visible:focus-shadow -m-3 block p-3 outline-hidden',
        { '[-webkit-touch-callout:none]': sortable },
      ]"
    >
      <div
        :class="[
          'aspect-square transition-[scale,filter] duration-200 ease-out',
          { 'drop-shadow-lifted motion-safe:scale-104': lifted },
        ]"
      >
        <!-- A picture fades in once it has loaded. One that comes with the
             page is asked for at the size the grid shows it; the others
             measure themselves when their turn comes. -->
        <magic-image
          v-if="wish.image"
          :src="wish.image"
          :provider="preview ? 'none' : undefined"
          :modifiers="modifiers"
          :sizes="SIZES"
          :preload="preload"
          :lazyload="!preload"
          :auto-sizes="!preload"
          alt=""
          class="block h-full w-full object-contain opacity-0 transition-[opacity,scale] duration-250 ease-out data-[loaded=true]:opacity-100 motion-safe:group-hover:scale-102"
        />
        <!-- Without a picture, the square the error page draws for an empty
             card, so the grid keeps its shape. -->
        <div
          v-else
          class="border-surface size-full border border-dashed"
          aria-hidden="true"
        />
      </div>
      <p class="mt-5">{{ wish.title }}</p>
      <p v-if="wish.caption" class="text-surface-muted">{{ wish.caption }}</p>
      <p v-if="wish.note" class="text-surface-muted">{{ wish.note }}</p>
    </a>
    <div
      v-if="$slots.actions"
      :class="[
        'absolute -top-1.5 -right-1.5 opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100',
        { invisible: lifted },
      ]"
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
  // The link doubles as the drag handle, so a long press on a phone picks
  // the card up instead of opening the link’s menu.
  sortable?: boolean
  // Picked up and following the pointer.
  lifted?: boolean
  // In the first row: the picture comes with the page.
  preload?: boolean
}

// The picture’s share of the screen at each width, as the grid lays the
// cards out (see grid-wishes in main.css), so the browser asks for the size
// it shows.
const SIZES = 'xs:100vw sm:50vw lg:50vw xl:33vw 2xl:25vw'

const {
  wish,
  preview = false,
  sortable = false,
  lifted = false,
  preload = false,
} = defineProps<WishCardProps>()

const linkRef = useTemplateRef('link')

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

defineExpose({ link: linkRef })
</script>
