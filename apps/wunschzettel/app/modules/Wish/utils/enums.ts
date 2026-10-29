export enum ToastIds {
  Wish = 'toast--wish',
}

// The drawer tags itself, so the toaster can move into it while it is open.
export const WishDrawerAttribute = 'data-wish-drawer'
export const WishDrawerSelector = `[${WishDrawerAttribute}]`
