import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import {
  completeOrderFromMayaPayment,
  fetchMayaCheckoutById,
  mapMayaGatewayStatus,
} from '@/lib/payments/maya-complete'

/**
 * Called from /checkout/success after Maya redirect. Verifies checkout with Maya (secret key),
 * then creates the order and clears the cart (same as webhook, idempotent).
 * Works for signed-in users and guests (payment matched by checkoutId).
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const body = await request.json().catch(() => ({}))
    let checkoutId = typeof body.checkoutId === 'string' ? body.checkoutId.trim() : ''

    const serviceRole = createServiceRoleClient()

    if (!checkoutId && user) {
      const { data: fallback } = await serviceRole
        .from('payments')
        .select('external_id')
        .eq('user_id', user.id)
        .eq('payment_method', 'maya')
        .eq('status', 'pending')
        .is('order_id', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      checkoutId = (fallback?.external_id as string | undefined)?.trim() || ''
    }

    if (!checkoutId) {
      return NextResponse.json(
        {
          error:
            'Could not determine checkout. Return here from the same browser after paying, or set MAYA webhooks for automatic fulfillment.',
        },
        { status: 400 }
      )
    }

    const { data: payment, error: payErr } = await serviceRole
      .from('payments')
      .select('*')
      .eq('external_id', checkoutId)
      .maybeSingle()

    if (payErr || !payment) {
      return NextResponse.json({ error: 'Payment not found for this checkout' }, { status: 404 })
    }

    if (user && payment.user_id && payment.user_id !== user.id) {
      return NextResponse.json({ error: 'This payment belongs to another account' }, { status: 403 })
    }

    if (payment.order_id) {
      const { data: existingOrder } = await serviceRole
        .from('orders')
        .select('order_number')
        .eq('id', payment.order_id)
        .maybeSingle()

      return NextResponse.json({
        ok: true,
        orderId: payment.order_id,
        orderNumber: existingOrder?.order_number ?? null,
        referenceNumber:
          (payment.metadata as { referenceNumber?: string } | null)?.referenceNumber ?? null,
        isGuest: !payment.user_id,
        alreadyFinalized: true,
      })
    }

    let row = payment

    if (payment.status !== 'completed') {
      const verify = await fetchMayaCheckoutById(checkoutId)
      if (!verify.ok) {
        return NextResponse.json({ error: verify.error }, { status: 503 })
      }
      const gatewayStatus = mapMayaGatewayStatus(
        verify.data.paymentStatus as string | undefined,
        verify.data.status as string | undefined
      )
      if (gatewayStatus !== 'completed') {
        return NextResponse.json(
          { error: 'Payment is not completed yet.', gatewayStatus },
          { status: 400 }
        )
      }

      const { error: updErr } = await serviceRole
        .from('payments')
        .update({
          status: 'completed',
          response_data: verify.data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id)

      if (updErr) {
        return NextResponse.json({ error: updErr.message }, { status: 500 })
      }

      row = { ...payment, status: 'completed', response_data: verify.data }
    }

    const result = await completeOrderFromMayaPayment(serviceRole, row)
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      referenceNumber: result.referenceNumber,
      isGuest: !payment.user_id,
      alreadyProcessed: result.alreadyProcessed,
    })
  } catch (e) {
    console.error('complete-success', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to finalize' },
      { status: 500 }
    )
  }
}
