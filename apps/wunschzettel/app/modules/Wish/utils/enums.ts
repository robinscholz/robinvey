export enum ToastIds {
  Wish = 'toast--wish',
}

// The drawer tags itself, so the toaster can move into it while it is open.
export const WishDrawerAttribute = 'data-wish-drawer'
export const WishDrawerSelector = `[${WishDrawerAttribute}]`

// Set on <html> before the add page paints when the address carries a
// product, and on what the page shows without one, which main.css then
// hides until the form has taken over.
export const WishReceivedAttribute = 'data-wish-received'
export const WishBookmarkletAttribute = 'data-wish-bookmarklet'
