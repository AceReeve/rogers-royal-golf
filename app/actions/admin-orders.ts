'use server'

import { revalidatePath } from 'next/cache'
import { fetchUserRoleForAdmin, isAdmin } from '@/lib/auth/is-admin'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { isOrderFulfillmentStatus } from '@/lib/orders/status'

export type OrderActionResult = { error: string } | { ok: true }

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in.' } as const

  const profile = await fetchUserRoleForAdmin(user.id)
  if (!isAdmin(user, profile)) {
    return { error: 'Admin access required.' } as const
  }
  return { user } as const
}

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<OrderActionResult> {
  const gate = await requireAdmin()
  if ('error' in gate) return { error: gate.error }

  if (!orderId?.trim()) {
    return { error: 'Missing order id.' }
  }

  if (!isOrderFulfillmentStatus(status)) {
    return { error: 'Invalid order status.' }
  }

  const db = createServiceRoleClient()
  const { error } = await db
    .from('orders')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/orders')
  revalidatePath('/admin')
  revalidatePath('/dashboard/orders')
  revalidatePath('/dashboard')

  return { ok: true }
}
