import { confirmOrderDeliveredForm } from '@/app/actions/customer-orders'
import { isDeliveredStatus, isOutForDeliveryStatus } from '@/lib/orders/status'

export function ConfirmDeliveryForm({
  orderId,
  status,
}: {
  orderId: string
  status: string | null | undefined
}) {
  if (isDeliveredStatus(status) || !isOutForDeliveryStatus(status)) {
    return null
  }

  return (
    <div className="rounded-lg border-2 border-primary/30 bg-primary/10 p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">Your order is out for delivery</p>
      <p className="text-sm text-muted-foreground">
        Received your package? Confirm below to mark this order as delivered.
      </p>
      <form action={confirmOrderDeliveredForm}>
        <input type="hidden" name="orderId" value={orderId} />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          I received my order
        </button>
      </form>
    </div>
  )
}
