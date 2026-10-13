'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteProductAction, deleteTourAction } from '@/app/actions/admin-catalog'

type Kind = 'product' | 'tour'

export function DeleteCatalogButton({
  kind,
  id,
  compact,
}: {
  kind: Kind
  id: string
  /** Table / dense layouts: no flex-grow, smaller padding */
  compact?: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      className={
        compact
          ? 'inline-flex shrink-0 items-center justify-center gap-1 rounded-lg border border-destructive px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-50'
          : 'flex flex-1 items-center justify-center gap-2 rounded-lg border border-destructive px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-50'
      }
      onClick={() => {
        if (!confirm('Delete this item? This cannot be undone.')) return
        startTransition(async () => {
          const res = kind === 'product' ? await deleteProductAction(id) : await deleteTourAction(id)
          if (res && 'error' in res && res.error) {
            alert(res.error)
            return
          }
          router.refresh()
        })
      }}
    >
      <Trash2 className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      {pending ? 'Deleting…' : 'Delete'}
    </button>
  )
}
