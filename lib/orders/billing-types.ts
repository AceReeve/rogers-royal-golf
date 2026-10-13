export type OrderBillingInfo = {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  zipCode?: string | null
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

export function parseOrderBillingInfo(raw: unknown): OrderBillingInfo | null {
  if (!isRecord(raw)) return null
  return {
    firstName: typeof raw.firstName === 'string' ? raw.firstName : null,
    lastName: typeof raw.lastName === 'string' ? raw.lastName : null,
    email: typeof raw.email === 'string' ? raw.email : null,
    phone: typeof raw.phone === 'string' ? raw.phone : null,
    address: typeof raw.address === 'string' ? raw.address : null,
    city: typeof raw.city === 'string' ? raw.city : null,
    zipCode: typeof raw.zipCode === 'string' ? raw.zipCode : null,
  }
}

export function hasBillingDetails(b: OrderBillingInfo | null): boolean {
  if (!b) return false
  return Boolean(
    b.firstName ||
      b.lastName ||
      b.email ||
      b.phone ||
      b.address ||
      b.city ||
      b.zipCode
  )
}

/** Reads billing from `billing_info` (if column exists) or from `notes` JSON (checkout snapshot). */
export function getOrderBillingSnapshot(order: {
  billing_info?: unknown
  notes?: string | null
}): OrderBillingInfo | null {
  const fromColumn = parseOrderBillingInfo(order.billing_info)
  if (fromColumn && hasBillingDetails(fromColumn)) return fromColumn

  const raw = typeof order.notes === 'string' ? order.notes.trim() : ''
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as { unoCheckoutBilling?: unknown }
    if (parsed?.unoCheckoutBilling) {
      const b = parseOrderBillingInfo(parsed.unoCheckoutBilling)
      if (b && hasBillingDetails(b)) return b
    }
  } catch {
    return null
  }
  return null
}
