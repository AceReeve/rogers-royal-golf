import { getBulkDiscountPercent } from '@/lib/cart/bulk-discount'

export type CartLineForTotals = {
  product_id: string
  quantity: number
  price: number
}

function roundMoney(value: number): number {
  return Number(value.toFixed(2))
}

export type CartTotals = {
  subtotal: number
  uniqueProductCount: number
  discountPercent: number
  discountAmount: number
  total: number
}

export function calculateCartTotals(lines: CartLineForTotals[]): CartTotals {
  const subtotal = roundMoney(
    lines.reduce((sum, line) => sum + (Number(line.price) || 0) * (line.quantity || 0), 0)
  )

  const uniqueProductCount = new Set(
    lines.map((line) => line.product_id).filter((id) => typeof id === 'string' && id.length > 0)
  ).size

  const discountPercent = getBulkDiscountPercent(uniqueProductCount)
  const discountAmount =
    discountPercent > 0 ? roundMoney((subtotal * discountPercent) / 100) : 0
  const total = roundMoney(subtotal - discountAmount)

  return {
    subtotal,
    uniqueProductCount,
    discountPercent,
    discountAmount,
    total,
  }
}

export function cartLinesFromCheckoutItems(
  items: Array<{
    product_id: string
    quantity: number
    products?: { price?: number | null } | null
  }>
): CartLineForTotals[] {
  return items.map((item) => ({
    product_id: item.product_id,
    quantity: item.quantity,
    price: Number(item.products?.price) || 0,
  }))
}
