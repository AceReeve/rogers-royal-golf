'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { normalizeOrderStatus, isOutForDeliveryStatus } from '@/lib/orders/status'
import { getStoreId } from '@/lib/store'

export type OrderActionResult = { error: string } | { ok: true }

/** Customer confirms receipt — only allowed when admin set status to out_for_delivery. */
export async function confirmOrderDelivered(orderId: string): Promise<OrderActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in.' }
  }

  if (!orderId?.trim()) {
    return { error: 'Missing order id.' }
  }

  const db = createServiceRoleClient()
  const storeId = await getStoreId()
  const { data: order, error: fetchError } = await db
    .from('orders')
    .select('id, user_id, status')
    .eq('id', orderId)
    .eq('store', storeId)
    .maybeSingle()

  if (fetchError || !order) {
    return { error: 'Order not found.' }
  }

  if (order.user_id !== user.id) {
    return { error: 'Order not found.' }
  }

  const status = normalizeOrderStatus(order.status)
  if (!isOutForDeliveryStatus(status)) {
    return { error: 'You can confirm delivery only when your order is out for delivery.' }
  }

  const { error: updateError } = await db
    .from('orders')
    .update({
      status: 'delivered',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('store', storeId)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath('/dashboard/orders')
  revalidatePath('/dashboard')
  revalidatePath('/admin/orders')

  return { ok: true }
}

/** HTML form action — works without client JavaScript. */
export async function confirmOrderDeliveredForm(formData: FormData): Promise<void> {
  const orderId = formData.get('orderId')
  if (typeof orderId !== 'string') return
  await confirmOrderDelivered(orderId)
}
