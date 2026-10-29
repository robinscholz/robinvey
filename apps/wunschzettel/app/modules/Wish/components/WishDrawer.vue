<template>
  <dialog
    ref="dialog"
    aria-label="Edit wish"
    class="border-line text-ink fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-none translate-x-full overflow-y-auto overscroll-contain border-l bg-white transition-[translate,overlay,display] transition-discrete duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] backdrop:bg-white/0 backdrop:transition-[background-color,overlay,display] backdrop:transition-discrete backdrop:duration-200 open:translate-x-0 open:duration-300 open:backdrop:bg-white/70 open:backdrop:duration-300 motion-reduce:transition-none motion-reduce:backdrop:transition-none sm:w-lg starting:open:translate-x-full starting:open:backdrop:bg-white/0"
    @close="close"
    @pointerdown="onPointerdown"
    @click="onClick"
  >
    <div class="min-h-full px-6 pt-8 pb-24 md:px-12 md:pt-12">
      <p class="text-right">
        <button
          type="button"
          class="text-muted hover:text-ink cursor-pointer"
          @click="close"
        >
          Close
        </button>
      </p>
      <form class="mt-20 md:mt-32" @submit.prevent="submit">
        <fieldset :disabled="pending !== null">
          <div class="flex flex-col gap-y-3">
            <WishFields v-model="draft" />
          </div>
          <p class="mt-16 flex items-baseline justify-between gap-x-6">
            <button
              v-if="complete || pending === 'load'"
              type="submit"
              class="link cursor-pointer disabled:cursor-default"
            >
              {{ pending === 'save' ? 'Saving …' : 'Save' }}
            </button>
            <span v-else class="text-muted"
              >Title and link are still missing.</span
            >
            <button
              type="button"
              class="text-muted enabled:hover:text-ink cursor-pointer disabled:cursor-default"
              @click="discard"
            >
              {{ pending === 'remove' ? 'Removing …' : 'Remove' }}
            </button>
          </p>
        </fieldset>
        <p v-if="notice" class="text-muted">{{ notice }}</p>
      </form>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { useWishEditorForm } from '../composables/private/useWishEditorForm'

const { save, remove } = await useWishes()
const { id, close } = useWishEditor()
const { draft, pending, failed, complete, submit, discard } = useWishEditorForm(
  { save, remove }
)

const dialogRef = useTemplateRef('dialog')

// Set on press, so a text selection dragged out of a field keeps it open.
let pressedOutside = false

const notice = computed(() => {
  switch (failed.value) {
    case 'load':
      return 'Loading did not work.'
    case 'save':
      return 'Saving did not work.'
    case 'remove':
      return 'Removing did not work.'
    default:
      return ''
  }
})

// A press on the backdrop lands on the dialog itself, outside its box.
function isOutside(event: MouseEvent): boolean {
  const dialog = dialogRef.value
  if (!dialog || event.target !== dialog) {
    return false
  }
  const { left, right, top, bottom } = dialog.getBoundingClientRect()
  const { clientX: x, clientY: y } = event
  return x < left || x > right || y < top || y > bottom
}

function onPointerdown(event: PointerEvent) {
  pressedOutside = isOutside(event)
}

function onClick(event: MouseEvent) {
  if (pressedOutside && isOutside(event)) {
    close()
  }
  pressedOutside = false
}

watch(
  () => id.value !== null,
  (active) => {
    if (active) {
      dialogRef.value?.showModal()
    } else {
      dialogRef.value?.close()
    }
  }
)
</script>
