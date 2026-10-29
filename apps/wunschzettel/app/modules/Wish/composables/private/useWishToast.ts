import WishToast from '../../components/WishToast.vue'
import { ToastIds } from '../../utils/enums'

interface ServerRefusal {
  statusCode: number
  data: { message: string }
}

// A refusal comes with the server’s reason, such as a missing sign-in; a
// crash on its side does not.
function isServerRefusal(error: unknown): error is ServerRefusal {
  return (
    error instanceof Error &&
    'statusCode' in error &&
    typeof error.statusCode === 'number' &&
    error.statusCode < 500 &&
    'data' in error &&
    typeof error.data === 'object' &&
    error.data !== null &&
    'message' in error.data &&
    typeof error.data.message === 'string'
  )
}

export function useWishToast() {
  const { add } = useMagicToast(ToastIds.Wish)

  // Public functions
  function announceSaved() {
    add({
      component: WishToast,
      props: { message: 'Saved.', tone: 'success' },
      options: { duration: 3000 },
    })
  }

  function announceSaveFailure(error: unknown) {
    add({
      component: WishToast,
      props: {
        message: 'Saving did not work.',
        tone: 'danger',
        reason: isServerRefusal(error) ? error.data.message : '',
      },
      options: { duration: 8000 },
    })
  }

  return {
    announceSaved,
    announceSaveFailure,
  }
}

export type UseWishToastReturn = ReturnType<typeof useWishToast>
