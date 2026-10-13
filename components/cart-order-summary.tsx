'use client'

import { formatPeso } from '@/lib/currency/format'
import {
  formatBulkDiscountHint,
  getBulkDiscountLabel,
  getBulkDiscountProgress,
} from '@/lib/cart/bulk-discount'
import type { CartTotals } from '@/lib/cart/cart-totals'

type CartOrderSummaryProps = {
  totals: CartTotals
  className?: string
}

export function CartOrderSummary({ totals, className = '' }: CartOrderSummaryProps) {
  const progress = getBulkDiscountProgress(totals.uniqueProductCount)
  const hint = formatBulkDiscountHint(progress)

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span>₱{formatPeso(totals.subtotal)}</span>
      </div>
      {totals.discountPercent > 0 ? (
        <div className="flex justify-between text-sm text-green-700 dark:text-green-400">
          <span>{getBulkDiscountLabel(totals.discountPercent)}</span>
          <span>−₱{formatPeso(totals.discountAmount)}</span>
        </div>
      ) : null}
      {hint ? (
        <p className="text-xs text-muted-foreground rounded-md border border-primary/10 bg-primary/5 p-2">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
