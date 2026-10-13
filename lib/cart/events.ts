export const CART_UPDATED_EVENT = 'cart:updated'

export function emitCartUpdated(delta = 0) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: { delta } }))
}
