<template>
  <DragDropProvider
    :sensors="SENSORS"
    @drag-over="onDragOver"
    @drag-end="onDragEnd"
  >
    <WishGrid :wishes="ordered">
      <template #default="{ wish, index, preload }">
        <WishSortableCard :wish="wish" :index="index" :preload="preload">
          <template v-if="$slots.actions" #actions>
            <slot name="actions" :wish="wish" />
          </template>
        </WishSortableCard>
      </template>
    </WishGrid>
  </DragDropProvider>
</template>

<script setup lang="ts">
import { PointerActivationConstraints } from '@dnd-kit/dom'
import { DragDropProvider, KeyboardSensor, PointerSensor } from '@dnd-kit/vue'
import { useWishToast } from '../composables/private/useWishToast'
import type { DragEndEvent, DragOverEvent } from '@dnd-kit/vue'

interface WishSortableGridProps {
  wishes: Array<Wish>
}

const { wishes } = defineProps<WishSortableGridProps>()

const { reorder } = await useWishes()
const { announceOrderFailure } = useWishToast()

// Each card’s link is its handle. A click still opens it: the mouse has to
// travel a little before the card comes up, and a finger has to rest on it
// first, so a swipe still scrolls. Space picks a card up, Enter opens it.
const SENSORS = [
  PointerSensor.configure({
    activationConstraints(event) {
      if (event.pointerType === 'touch') {
        return [
          new PointerActivationConstraints.Delay({ value: 250, tolerance: 5 }),
        ]
      }
      return [new PointerActivationConstraints.Distance({ value: 5 })]
    },
  }),
  KeyboardSensor.configure({
    keyboardCodes: {
      ...KeyboardSensor.defaults.keyboardCodes,
      start: ['Space'],
    },
  }),
]

// The order a drop would leave, while a card is dragged: the other cards
// already sit where they will end up, and dnd-kit animates them there.
const draft = shallowRef<Array<string> | null>(null)

const ordered = computed(() => {
  if (!draft.value) {
    return wishes
  }
  const byId = new Map(wishes.map((wish) => [wish.id, wish]))
  return draft.value.flatMap((id) => byId.get(id) ?? [])
})

function storedOrder(): Array<string> {
  return wishes.map((wish) => wish.id)
}

// A card dragged over another takes its place.
function orderAfter(
  event: DragOverEvent | DragEndEvent,
  before: Array<string>
): Array<string> {
  const { source, target } = event.operation
  if (!source || !target || source.id === target.id) {
    return before
  }
  const moved = String(source.id)
  const to = before.indexOf(String(target.id))
  if (to === -1 || !before.includes(moved)) {
    return before
  }
  const after = before.filter((id) => id !== moved)
  after.splice(to, 0, moved)
  return after
}

async function save(order: Array<string>) {
  try {
    await reorder(order)
  } catch (error) {
    announceOrderFailure(error)
  }
}

function onDragOver(event: DragOverEvent) {
  draft.value = orderAfter(event, draft.value ?? storedOrder())
}

function onDragEnd(event: DragEndEvent) {
  const before = storedOrder()
  const after = draft.value ?? orderAfter(event, before)
  draft.value = null
  if (event.canceled || after.join('\n') === before.join('\n')) {
    return
  }
  void save(after)
}

defineSlots<{
  actions?: (props: { wish: Wish }) => unknown
}>()
</script>
