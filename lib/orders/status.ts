/** Customer-facing fulfillment statuses (stored lowercase in DB). */
export const ORDER_FULFILLMENT_STATUSES = [
  'preparing',
  'out_for_delivery',
  'delivered',
] as const

export type OrderFulfillmentStatus = (typeof ORDER_FULFILLMENT_STATUSES)[number]

export function isOrderFulfillmentStatus(value: string): value is OrderFulfillmentStatus {
  return (ORDER_FULFILLMENT_STATUSES as readonly string[]).includes(value)
}

/** Map legacy payment-era and common typos to canonical fulfillment status. */
export function normalizeOrderStatus(status: string | null | undefined): string {
  const raw = (status ?? '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_')
    .replace(/\s+/g, '_')

  if (raw === 'confirmed' || raw === 'completed') return 'preparing'
  if (
    raw === 'out_for_delivery' ||
    raw === 'out_of_delivery' ||
    raw === 'outofdelivery' ||
    raw === 'out_for_deliver' ||
    raw === 'out_of_deliver'
  ) {
    return 'out_for_delivery'
  }
  if (raw === 'delivered' || raw === 'complete') return 'delivered'

  return raw || 'preparing'
}

export function isOutForDeliveryStatus(status: string | null | undefined): boolean {
  return normalizeOrderStatus(status) === 'out_for_delivery'
}

export function isDeliveredStatus(status: string | null | undefined): boolean {
  return normalizeOrderStatus(status) === 'delivered'
}

export function formatOrderStatusLabel(status: string | null | undefined): string {
  const s = normalizeOrderStatus(status)
  switch (s) {
    case 'preparing':
      return 'Preparing'
    case 'out_for_delivery':
      return 'Out for delivery'
    case 'delivered':
      return 'Delivered'
    case 'pending':
      return 'Pending payment'
    case 'cancelled':
      return 'Cancelled'
    case 'failed':
      return 'Failed'
    case 'refunded':
      return 'Refunded'
    default:
      return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }
}

export function orderStatusBadgeClass(status: string | null | undefined): string {
  const s = normalizeOrderStatus(status)
  switch (s) {
    case 'preparing':
      return 'bg-amber-100 text-amber-900'
    case 'out_for_delivery':
      return 'bg-blue-100 text-blue-900'
    case 'delivered':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'cancelled':
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'refunded':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
