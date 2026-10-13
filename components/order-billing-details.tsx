import type { OrderBillingInfo } from '@/lib/orders/billing-types'
import { hasBillingDetails } from '@/lib/orders/billing-types'

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div>
      <p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
      <p className="font-medium mt-0.5">{value}</p>
    </div>
  )
}

export function OrderBillingDetails({
  billing,
  title = 'Billing & contact',
}: {
  billing: OrderBillingInfo | null
  title?: string
}) {
  if (!billing || !hasBillingDetails(billing)) return null

  const fullName = [billing.firstName, billing.lastName].filter(Boolean).join(' ').trim()
  const addressBlock = [billing.address, billing.city].filter(Boolean).join('\n')

  return (
    <div className="border-t pt-4">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
        <Field label="Name" value={fullName || undefined} />
        <Field label="Email" value={billing.email || undefined} />
        <Field label="Phone" value={billing.phone || undefined} />
        <Field label="Postal code" value={billing.zipCode || undefined} />
        {addressBlock ? (
          <div className="sm:col-span-2">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Street & city</p>
            <p className="font-medium mt-0.5 whitespace-pre-line">{addressBlock}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
