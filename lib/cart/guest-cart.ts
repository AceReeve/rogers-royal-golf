export const GUEST_CART_STORAGE_KEY = 'rrg_guest_cart_v1'

export type GuestCartProduct = {
  id: string
  name: string
  price: number
  image_url?: string | null
}

export type GuestCartItem = {
  id: string
  product_id: string
  quantity: number
  products: GuestCartProduct
}

function isBrowser() {
  return typeof window !== 'undefined'
}

function readRaw(): GuestCartItem[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is GuestCartItem =>
        item &&
        typeof item === 'object' &&
        typeof item.product_id === 'string' &&
        typeof item.quantity === 'number' &&
        item.products &&
        typeof item.products.name === 'string'
    )
  } catch {
    return []
  }
}

function writeRaw(items: GuestCartItem[]) {
  if (!isBrowser()) return
  try {
    localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* storage unavailable */
  }
}

export function getGuestCartItems(): GuestCartItem[] {
  return readRaw()
}

export function getGuestCartCount(): number {
  return readRaw().reduce((sum, item) => sum + (item.quantity || 0), 0)
}

export function addGuestCartItem(product: GuestCartProduct, quantity = 1) {
  const qty = Math.max(1, Math.floor(quantity))
  const items = readRaw()
  const existing = items.find((item) => item.product_id === product.id)

  if (existing) {
    existing.quantity += qty
  } else {
    items.push({
      id: `guest-${product.id}`,
      product_id: product.id,
      quantity: qty,
      products: {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url ?? null,
      },
    })
  }

  writeRaw(items)
}

export function updateGuestCartQuantity(productId: string, quantity: number) {
  const items = readRaw()
  const next = items
    .map((item) =>
      item.product_id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
    )
    .filter((item) => item.quantity > 0)
  writeRaw(next)
}

export function removeGuestCartItem(productId: string) {
  writeRaw(readRaw().filter((item) => item.product_id !== productId))
}

export function clearGuestCart() {
  if (!isBrowser()) return
  try {
    localStorage.removeItem(GUEST_CART_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
