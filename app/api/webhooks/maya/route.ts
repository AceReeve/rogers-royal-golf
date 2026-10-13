import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { completeOrderFromMayaPayment, mapMayaGatewayStatus } from '@/lib/payments/maya-complete'
import { NextResponse } from 'next/server'

/**
 * Maya Checkout webhooks send the same shape as GET Payment.
 * Docs: use `paymentStatus` for the event; `status` is also present on many payloads.
 * @see https://developers.maya.ph/page/webhook-sample-json-data
 */

async function findPaymentRow(
  supabase: ReturnType<typeof createServiceRoleClient>,
  body: Record<string, unknown>
) {
  const checkoutId =
    (typeof body.checkoutId === 'string' && body.checkoutId) ||
    (typeof body.checkout_id === 'string' && body.checkout_id) ||
    (typeof body.id === 'string' && body.id) ||
    ''

  if (checkoutId) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('external_id', checkoutId)
      .maybeSingle()
    if (!error && data) return data
  }

  const ref =
    typeof body.requestReferenceNumber === 'string' ? body.requestReferenceNumber.trim() : ''
  if (ref) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .contains('metadata', { referenceNumber: ref })
      .maybeSingle()
    if (!error && data) return data
  }

  return null
}

export async function POST(request: Request) {
  const supabase = createServiceRoleClient()

  try {
    const body = (await request.json()) as Record<string, unknown>
    const paymentStatus = mapMayaGatewayStatus(
      typeof body.paymentStatus === 'string' ? body.paymentStatus : undefined,
      typeof body.status === 'string' ? body.status : undefined
    )

    // Restrict to Maya IPs at nginx / firewall (see Maya webhook docs — sandbox vs production lists).

    const paymentRow = await findPaymentRow(supabase, body)

    if (!paymentRow) {
      console.warn('[maya webhook] No matching payments row', {
        id: body.id,
        checkoutId: body.checkoutId,
        requestReferenceNumber: body.requestReferenceNumber,
      })
      return NextResponse.json({ success: true, skipped: 'payment_not_found' })
    }

    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        response_data: body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentRow.id)

    if (updateError) throw updateError

    // If payment completed, create order
    if (paymentStatus === 'completed') {
      const payment = paymentRow

      if (payment?.order_id) {
        return NextResponse.json({ success: true, alreadyProcessed: true })
      }

      const orderResult = await completeOrderFromMayaPayment(supabase, payment)
      if (!orderResult.ok) {
        if (orderResult.message === 'no_items_in_payment') {
          console.warn('[maya webhook]', orderResult.message)
        } else {
          throw new Error(orderResult.message)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
