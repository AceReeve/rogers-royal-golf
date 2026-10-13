import type { SupabaseClient } from '@supabase/supabase-js'
import { sendOrderConfirmationEmail } from '@/lib/email/send-order-confirmation'

function cleanEnvValue(value?: string) {
  return value?.trim().replace(/^['"]|['"]$/g, '') ?? ''
}

/** Same host family as create-intent; returns origin like https://pg-sandbox.paymaya.com */
export function getMayaCheckoutRoot(): string {
  const configured = cleanEnvValue(process.env.MAYA_CHECKOUT_BASE_URL || process.env.MAYA_API_BASE)
  const fallback =
    process.env.NODE_ENV === 'production'
      ? 'https://pg.paymaya.com'
      : 'https://pg-sandbox.paymaya.com'
  let base = (configured || fallback).replace(/\/+$/, '')
  if (base.endsWith('/checkout/v1/checkouts')) {
    base = base.replace(/\/checkout\/v1\/checkouts$/i, '')
  } else if (base.endsWith('/checkout/v1')) {
    base = base.replace(/\/checkout\/v1$/i, '')
  }
  if (/^https:\/\/pg(-sandbox)?\.paymaya\.com$/i.test(base)) return base
  try {
    const u = new URL(base)
    return `${u.protocol}//${u.host}`
  } catch {
    return fallback
  }
}

/** Map Maya GET Payment / webhook fields to internal payment status. */
export function mapMayaGatewayStatus(
  paymentStatus?: string,
  status?: string
): 'completed' | 'failed' | 'cancelled' | 'pending' {
  const raw = paymentStatus || status
  switch (raw) {
    case 'PAYMENT_SUCCESS':
    case 'COMPLETED':
    case 'PAID':
      return 'completed'
    case 'PAYMENT_FAILED':
    case 'FAILED':
    case 'DECLINED':
      return 'failed'
    case 'PAYMENT_EXPIRED':
    case 'PAYMENT_CANCELLED':
    case 'CANCELLED':
    case 'VOIDED':
      return 'cancelled'
    default:
      return 'pending'
  }
}

export async function fetchMayaCheckoutById(checkoutId: string): Promise<
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: string }
> {
  const secret = cleanEnvValue(process.env.MAYA_SECRET_KEY)
  if (!secret || !secret.startsWith('sk-')) {
    return {
      ok: false,
      error:
        'Set MAYA_SECRET_KEY (sk-...) on the server to verify checkout after redirect. Create Checkout uses the public key; GET checkout requires the secret.',
    }
  }
  const root = getMayaCheckoutRoot()
  const url = `${root}/checkout/v1/checkouts/${encodeURIComponent(checkoutId)}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${Buffer.from(`${secret}:`).toString('base64')}`,
    },
    cache: 'no-store',
  })
  const text = await res.text()
  if (!res.ok) {
    return { ok: false, error: text || `Maya GET checkout failed (${res.status})` }
  }
  try {
    return { ok: true, data: JSON.parse(text) as Record<string, unknown> }
  } catch {
    return { ok: false, error: 'Invalid JSON from Maya GET checkout' }
  }
}

type PaymentRow = {
  id: string
  user_id: string | null
  amount: number
  payment_method: string
  external_id?: string | null
  order_id?: string | null
  metadata?: {
    referenceNumber?: string
    items?: Array<{
      product_id?: string
      id?: string
      name?: string
      quantity: number
      price: number
    }>
    billingInfo?: {
      firstName?: string
      lastName?: string
      email?: string
      phone?: string
      address?: string
      city?: string
      zipCode?: string
    }
  } | null
}

/**
 * Idempotent: creates order + order_items, links payment, clears cart. Used by webhook and success finalizer.
 */
export async function completeOrderFromMayaPayment(
  supabase: SupabaseClient,
  payment: PaymentRow
): Promise<
  | {
      ok: true
      orderId: string
      orderNumber: string | null
      referenceNumber: string | null
      alreadyProcessed: boolean
    }
  | { ok: false; message: string }
> {
  if (payment.order_id) {
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('order_number')
      .eq('id', payment.order_id)
      .maybeSingle()

    return {
      ok: true,
      orderId: payment.order_id,
      orderNumber: (existingOrder?.order_number as string | undefined) ?? null,
      referenceNumber: payment.metadata?.referenceNumber ?? null,
      alreadyProcessed: true,
    }
  }

  const items = payment.metadata?.items
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, message: 'no_items_in_payment' }
  }

  const billingInfo = payment.metadata?.billingInfo || {}

  const billingSnapshot = {
    firstName: billingInfo.firstName || null,
    lastName: billingInfo.lastName || null,
    email: billingInfo.email || null,
    phone: billingInfo.phone || null,
    address: billingInfo.address || null,
    city: billingInfo.city || null,
    zipCode: billingInfo.zipCode || null,
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: payment.user_id ?? null,
      total_amount: payment.amount,
      status: 'preparing',
      payment_method: payment.payment_method,
      payment_id: payment.external_id || payment.id,
      shipping_address: billingInfo.address || null,
      shipping_city: billingInfo.city || null,
      shipping_postal_code: billingInfo.zipCode || null,
      shipping_country: 'PH',
      // Snapshot in `notes` so orders work without a `billing_info` DB column. If you add
      // billing_info (scripts/02-add-orders-billing-info.sql), you can backfill from notes.
      notes: JSON.stringify({ unoCheckoutBilling: billingSnapshot }),
    })
    .select()
    .single()

  if (orderError) {
    return { ok: false, message: orderError.message }
  }

  const { error: itemsError } = await supabase.from('order_items').insert(
    items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id || item.id,
      product_name: item.name || 'Product',
      quantity: item.quantity,
      price: item.price,
    }))
  )

  if (itemsError) {
    return { ok: false, message: itemsError.message }
  }

  const { error: paymentLinkError } = await supabase
    .from('payments')
    .update({
      order_id: order.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id)

  if (paymentLinkError) {
    return { ok: false, message: paymentLinkError.message }
  }

  if (payment.user_id) {
    const { error: cartError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', payment.user_id)

    if (cartError) {
      console.error('[completeOrderFromMayaPayment] cart clear:', cartError)
    }
  }

  const orderNumber = (order.order_number as string | undefined) ?? null
  const referenceNumber = payment.metadata?.referenceNumber ?? null
  const recipientEmail = billingInfo.email?.trim()

  if (recipientEmail) {
    const emailResult = await sendOrderConfirmationEmail({
      to: recipientEmail,
      customerName:
        [billingInfo.firstName, billingInfo.lastName].filter(Boolean).join(' ').trim() ||
        'Customer',
      orderNumber: orderNumber || String(order.id).slice(0, 8).toUpperCase(),
      referenceNumber,
      totalAmount: Number(payment.amount) || 0,
      items: items.map((item) => ({
        name: item.name || 'Product',
        quantity: item.quantity,
        price: item.price,
      })),
    })

    if (!emailResult.sent) {
      console.warn('[completeOrderFromMayaPayment] order email not sent:', emailResult.reason)
    }
  }

  return {
    ok: true,
    orderId: order.id as string,
    orderNumber,
    referenceNumber,
    alreadyProcessed: false,
  }
}
