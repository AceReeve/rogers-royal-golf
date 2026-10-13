'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatus } from '@/app/actions/admin-orders'
import {
  ORDER_FULFILLMENT_STATUSES,
  formatOrderStatusLabel,
  normalizeOrderStatus,
} from '@/lib/orders/status'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: string
}) {
  const [error, setError] = useState<string | null>(null)
  const [value, setValue] = useState(normalizeOrderStatus(currentStatus))
  const [pending, startTransition] = useTransition()

  const onChange = (next: string) => {
    setValue(next)
    setError(null)
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, next)
      if ('error' in result) {
        setError(result.error)
        setValue(normalizeOrderStatus(currentStatus))
      }
    })
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">Fulfillment status</p>
      <Select value={value} onValueChange={onChange} disabled={pending}>
        <SelectTrigger className="w-full max-w-xs">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {ORDER_FULFILLMENT_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {formatOrderStatusLabel(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {pending ? <p className="text-xs text-muted-foreground">Updating…</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
