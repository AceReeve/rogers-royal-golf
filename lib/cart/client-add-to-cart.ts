'use client'

import { getCurrentUser } from '@/app/actions/auth'
import { emitCartUpdated } from '@/lib/cart/events'
import { addGuestCartItem, type GuestCartProduct } from '@/lib/cart/guest-cart'

export type AddToCartResult =
  | { ok: true; guest: boolean }
  | { ok: false; error: string }

export async function addProductToCart(
  product: GuestCartProduct,
  quantity = 1
): Promise<AddToCartResult> {
  const user = await getCurrentUser()

  if (!user) {
    addGuestCartItem(product, quantity)
    emitCartUpdated(quantity)
    return { ok: true, guest: true }
  }

  const res = await fetch('/api/cart', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id: product.id, quantity }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return {
      ok: false,
      error: typeof data.error === 'string' ? data.error : 'Failed to add to cart',
    }
  }

  emitCartUpdated(quantity)
  return { ok: true, guest: false }
}
