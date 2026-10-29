<template>
  <WishCard
    ref="card"
    :wish="wish"
    sortable
    :lifted="isDragging"
    :preload="preload"
  >
    <template v-if="$slots.actions" #actions>
      <slot name="actions" />
    </template>
  </WishCard>
</template>

<script setup lang="ts">
import { Feedback } from '@dnd-kit/dom'
import { SortableKeyboardPlugin } from '@dnd-kit/dom/sortable'
import { useSortable } from '@dnd-kit/vue/sortable'

interface WishSortableCardProps {
  wish: Wish
  index: number
  preload?: boolean
}

const { wish, index, preload = false } = defineProps<WishSortableCardProps>()

const cardRef = useTemplateRef('card')

// The app’s --ease-out, for the cards making room and the drop.
const MOTION = { duration: 250, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }

// The defaults minus the optimistic sorting plugin: Vue owns the DOM, the
// grid reorders its cards while one is dragged and dnd-kit animates each
// card to its new place.
const PLUGINS = [
  SortableKeyboardPlugin,
  Feedback.configure({ dropAnimation: MOTION }),
]

const { isDragging } = useSortable({
  id: () => wish.id,
  index: () => index,
  element: cardRef,
  handle: () => cardRef.value?.link,
  transition: MOTION,
  plugins: PLUGINS,
})

defineSlots<{
  actions?: () => unknown
}>()
</script>
