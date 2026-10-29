import {
  draftToPayload,
  emptyDraft,
  recordToDraft,
  wishToDraft,
} from '../../utils/draft'
import { useWishToast } from './useWishToast'
import type { WishInsert, WishRecord } from '@robinscholz/database'
import type { WishDraft } from '../../utils/draft'

type WishEditorTask = 'load' | 'save' | 'remove'

interface UseWishEditorFormOptions {
  wishes: Readonly<Ref<Array<Wish>>>
  save: (wish: WishInsert) => Promise<unknown>
  remove: (id: string) => Promise<unknown>
}

interface RunPayload {
  task: WishEditorTask
  action: () => Promise<void>
  // Hears of a failure even once the drawer has moved on.
  onError?: (error: unknown) => void
}

export function useWishEditorForm({
  wishes,
  save,
  remove,
}: UseWishEditorFormOptions) {
  const { id, close } = useWishEditor()
  const { announceSaved, announceSaveFailure } = useWishToast()

  // Public state
  const draft = reactive<WishDraft>(emptyDraft())
  const pending = shallowRef<WishEditorTask | null>(null)
  const failed = shallowRef<WishEditorTask | null>(null)

  const complete = computed(() =>
    Boolean(draft.title.trim() && draft.url.trim())
  )

  // Private functions
  // A wish opened, closed or swapped meanwhile drops what is still running.
  async function run({ task, action, onError }: RunPayload) {
    const current = id.value
    pending.value = task
    failed.value = null
    try {
      await action()
    } catch (error) {
      onError?.(error)
      if (id.value === current) {
        failed.value = task
      }
    } finally {
      if (id.value === current) {
        pending.value = null
      }
    }
  }

  // Each opening reads the stored wish afresh. What the list already shows
  // of it fills the form at once; the rest comes with the record.
  async function load(wishId: string | null) {
    if (!wishId) {
      return
    }
    const known = wishes.value.find((wish) => wish.id === wishId)
    Object.assign(draft, emptyDraft(), known ? wishToDraft(known) : {})
    await run({
      task: 'load',
      action: async () => {
        const record = await $fetch<WishRecord>(
          `/api/wishes/${encodeURIComponent(wishId)}`
        )
        if (id.value === wishId) {
          Object.assign(draft, recordToDraft(record))
        }
      },
    })
  }

  // Public functions
  // Without `added`, the server keeps the day the wish came in; the id stays
  // even when the title changes.
  async function submit() {
    const wishId = id.value
    if (!wishId || !complete.value) {
      return
    }
    await run({
      task: 'save',
      action: async () => {
        await save({ id: wishId, ...draftToPayload(draft) })
        close()
        announceSaved()
      },
      onError: announceSaveFailure,
    })
  }

  async function discard() {
    const wishId = id.value
    if (!wishId) {
      return
    }
    await run({
      task: 'remove',
      action: async () => {
        await remove(wishId)
        close()
      },
    })
  }

  // The draft stays as it is on close, so the drawer slides out unchanged.
  watch(id, load)

  // Leaving the page with the drawer open must not leave it open for the
  // next visit.
  onScopeDispose(close)

  return {
    draft,
    pending,
    failed,
    complete,
    submit,
    discard,
  }
}

export type UseWishEditorFormReturn = ReturnType<typeof useWishEditorForm>
