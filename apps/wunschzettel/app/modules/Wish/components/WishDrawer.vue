<template>
  <dialog
    ref="dialog"
    :[WishDrawerAttribute]="''"
    aria-label="Edit wish"
    class="border-surface text-surface bg-surface-low fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-none translate-x-full overflow-y-auto overscroll-contain border-l transition-[translate,overlay,display] transition-discrete duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] backdrop:bg-transparent backdrop:transition-[background-color,overlay,display] backdrop:transition-discrete backdrop:duration-200 open:translate-none open:duration-300 open:backdrop:bg-[color-mix(in_oklab,var(--mirror-bg-surface-low)_70%,transparent)] open:backdrop:duration-300 motion-reduce:transition-none motion-reduce:backdrop:transition-none sm:w-lg starting:open:translate-x-full starting:open:backdrop:bg-transparent"
    @cancel="onCancel"
    @close="close"
    @pointerdown="onPointerdown"
    @click="onClick"
  >
    <div class="min-h-full px-6 pt-8 pb-24 md:px-12 md:pt-12">
      <p class="text-right">
        <WishButton @click="close">Close</WishButton>
      </p>
      <form class="mt-20 md:mt-32" @submit.prevent="submit">
        <fieldset :disabled="pending !== null">
          <div class="flex flex-col gap-y-3">
            <WishFields v-model="draft" />
          </div>
          <p class="mt-16 flex items-baseline justify-end gap-x-8">
            <WishButton
              ref="removeButton"
              variant="danger"
              :loading="pending === 'remove'"
              @click="removing = true"
            >
              {{ pending === 'remove' ? 'Removing …' : 'Remove' }}
            </WishButton>
            <WishButton
              v-if="complete || pending === 'load'"
              variant="success"
              type="submit"
              :loading="pending === 'save'"
            >
              {{ pending === 'save' ? 'Saving …' : 'Save' }}
            </WishButton>
            <span v-else class="text-surface-muted"
              >Title and link are still missing.</span
            >
          </p>
        </fieldset>
        <p v-if="notice" class="text-surface-muted">{{ notice }}</p>
      </form>
      <WishRemoveDialog
        v-model:open="removing"
        :title="draft.title.trim()"
        :final-focus="() => removeButtonRef?.$el ?? null"
        @confirm="discard"
      />
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { useWishEditorForm } from '../composables/private/useWishEditorForm'
import { WishDrawerAttribute } from '../utils/enums'

const { wishes, save, remove } = await useWishes()
const { id, close } = useWishEditor()
const { draft, pending, failed, complete, submit, discard } = useWishEditorForm(
  { wishes, save, remove }
)

const dialogRef = useTemplateRef('dialog')
const removeButtonRef = useTemplateRef('removeButton')

// Asking before a remove.
const removing = shallowRef(false)

// Set on press, so a text selection dragged out of a field keeps it open.
let pressedOutside = false

// Saving answers with a toast instead.
const notice = computed(() => {
  switch (failed.value) {
    case 'load':
      return 'Loading did not work.'
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

// While the alert asks, Escape answers it and leaves the drawer open.
function onCancel(event: Event) {
  if (removing.value) {
    event.preventDefault()
    removing.value = false
  }
}

function onPointerdown(event: PointerEvent) {
  pressedOutside = !removing.value && isOutside(event)
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
      removing.value = false
      dialogRef.value?.close()
    }
  }
)
</script>
