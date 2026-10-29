import { draftToPayload, emptyDraft, recordToDraft } from '../../utils/draft'
import type { WishInsert, WishRecord } from '@robinscholz/database'
import type { WishDraft } from '../../utils/draft'

type WishEditorTask = 'load' | 'save' | 'remove'

interface UseWishEditorFormOptions {
  save: (wish: WishInsert) => Promise<unknown>
  remove: (id: string) => Promise<unknown>
}

export function useWishEditorForm({ save, remove }: UseWishEditorFormOptions) {
  const { id, close } = useWishEditor()

  // Public state
  const draft = reactive<WishDraft>(emptyDraft())
  const pending = shallowRef<WishEditorTask | null>(null)
  const failed = shallowRef<WishEditorTask | null>(null)

  const complete = computed(() =>
    Boolean(draft.title.trim() && draft.url.trim())
  )

  // Private functions
  // A wish opened, closed or swapped meanwhile drops what is still running.
  async function run(task: WishEditorTask, action: () => Promise<void>) {
    const current = id.value
    pending.value = task
    failed.value = null
    try {
      await action()
    } catch {
      if (id.value === current) {
        failed.value = task
      }
    } finally {
      if (id.value === current) {
        pending.value = null
      }
    }
  }

  // Each opening reads the stored wish afresh.
  async function load(wishId: string | null) {
    if (!wishId) {
      return
    }
    Object.assign(draft, emptyDraft())
    await run('load', async () => {
      const record = await $fetch<WishRecord>(
        `/api/wishes/${encodeURIComponent(wishId)}`
      )
      if (id.value === wishId) {
        Object.assign(draft, recordToDraft(record))
      }
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
    await run('save', async () => {
      await save({ id: wishId, ...draftToPayload(draft) })
      close()
    })
  }

  async function discard() {
    const wishId = id.value
    if (!wishId) {
      return
    }
    await run('remove', async () => {
      await remove(wishId)
      close()
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
