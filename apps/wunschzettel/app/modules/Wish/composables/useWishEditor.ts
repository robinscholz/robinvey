export function useWishEditor() {
  const { loggedIn } = useUserSession()

  // Public state
  const id = useState<string | null>('wish-editor', () => null)

  // `nuxt dev` lets every write through, so it shows the editor too.
  const editable = computed(() => import.meta.dev || loggedIn.value)

  // Public functions
  function edit(wishId: string) {
    id.value = wishId
  }

  function close() {
    id.value = null
  }

  return {
    id,
    editable,
    edit,
    close,
  }
}

export type UseWishEditorReturn = ReturnType<typeof useWishEditor>
