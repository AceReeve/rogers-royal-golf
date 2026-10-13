'use client'

import { getCurrentUser } from '@/app/actions/auth'
import { getGuestCartItems, type GuestCartItem } from '@/lib/cart/guest-cart'

export type CheckoutCartItem = {
  id: string
  product_id: string
  quantity: number
  products?: {
    id: string
    name: string
    price: number
    image_url?: string | null
  }
}

export async function loadCartItems(): Promise<{ items: CheckoutCartItem[]; isGuest: boolean }> {
  const user = await getCurrentUser()

  if (user) {
    const res = await fetch('/api/cart', { credentials: 'include' })
    if (!res.ok) throw new Error('Failed to fetch cart')
    const data = await res.json()
    return { items: data.items || [], isGuest: false }
  }

  return { items: getGuestCartItems() as CheckoutCartItem[], isGuest: true }
}

export function guestItemToCheckoutItem(item: GuestCartItem): CheckoutCartItem {
  return item
}
