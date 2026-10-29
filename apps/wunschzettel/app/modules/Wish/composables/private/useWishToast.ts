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

  // Private functions
  function announceSuccess(message: string) {
    add({
      component: WishToast,
      props: { message, tone: 'success' },
      options: { duration: 3000 },
    })
  }

  // Public functions
  function announceAdded() {
    announceSuccess('The wish is on the list.')
  }

  function announceSaved() {
    announceSuccess('Your changes are saved.')
  }

  function announceSaveFailure(error: unknown) {
    add({
      component: WishToast,
      props: {
        message: 'The wish could not be saved.',
        tone: 'danger',
        reason: isServerRefusal(error) ? error.data.message : '',
      },
      options: { duration: 8000 },
    })
  }

  return {
    announceAdded,
    announceSaved,
    announceSaveFailure,
  }
}

export type UseWishToastReturn = ReturnType<typeof useWishToast>
