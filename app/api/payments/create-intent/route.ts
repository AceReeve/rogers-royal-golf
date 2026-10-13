import { ensurePublicUserRowForAuthUser } from '@/lib/auth/ensure-public-user'
import { getBulkDiscountLabel } from '@/lib/cart/bulk-discount'
import { calculateCartTotals } from '@/lib/cart/cart-totals'
import { digitsOnly, isValidPhone, normalizePhoneForGateway, sanitizePhoneInput } from '@/lib/phone'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextResponse } from 'next/server'

// MAYA Payment Gateway Integration
// Documentation: https://developers.maya.ph/reference/createv1checkout

const DEFAULT_MAYA_CHECKOUT_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://pg.paymaya.com'
    : 'https://pg-sandbox.paymaya.com'

function cleanEnvValue(value?: string) {
  return value?.trim().replace(/^['"]|['"]$/g, '') ?? ''
}

function formatAmount(value: number) {
  return Number(value.toFixed(2))
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/
const ZIP_CODE_REGEX = /^\d{4,10}$/

function getMayaPublicKey() {
  return cleanEnvValue(process.env.MAYA_PUBLIC_KEY || process.env.MAYA_API_KEY)
}

/** Maya Checkout / Kount buyer shape — see Create Checkout API (buyer.contact required). */
function buildMayaBuyer(
  normalizedBillingInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    zipCode: string
  },
  normalizedBuyerPhone: string,
  user: { email?: string | null; phone?: string | null; user_metadata?: Record<string, unknown> } | null
) {
  const firstName =
    normalizedBillingInfo.firstName ||
    (user && typeof user.user_metadata?.display_name === 'string'
      ? user.user_metadata.display_name.split(' ')[0]
      : 'Customer')
  const lastName =
    normalizedBillingInfo.lastName ||
    (user && typeof user.user_metadata?.display_name === 'string'
      ? user.user_metadata.display_name.split(' ').slice(1).join(' ')
      : '')
  const email = normalizedBillingInfo.email || user?.email || ''
  const phone = normalizedBuyerPhone || user?.phone || ''

  const line1 = normalizedBillingInfo.address || 'N/A'
  const city = normalizedBillingInfo.city || 'N/A'
  const state = normalizedBillingInfo.city || 'N/A'
  const zipCode = normalizedBillingInfo.zipCode

  const addressBlock = {
    line1,
    city,
    state,
    zipCode,
    countryCode: 'PH',
  }

  return {
    firstName,
    lastName,
    contact: {
      phone,
      email,
    },
    billingAddress: addressBlock,
    shippingAddress: {
      ...addressBlock,
      firstName,
      lastName,
      phone,
      email,
      shippingType: 'SD',
    },
  }
}

function getMayaCheckoutUrl() {
  const configuredBase = cleanEnvValue(
    process.env.MAYA_CHECKOUT_BASE_URL || process.env.MAYA_API_BASE
  )
  const normalizedBase = (configuredBase || DEFAULT_MAYA_CHECKOUT_BASE_URL).replace(/\/+$/, '')

  if (normalizedBase.endsWith('/checkout/v1/checkouts')) return normalizedBase
  if (normalizedBase.endsWith('/checkout/v1')) return `${normalizedBase}/checkouts`
  if (/^https:\/\/pg(-sandbox)?\.paymaya\.com$/i.test(normalizedBase)) {
    return `${normalizedBase}/checkout/v1/checkouts`
  }

  return `${normalizedBase}/checkout/v1/checkouts`
}

function getAppUrl(request: Request) {
  // APP_URL: server-only, read at runtime (set on VPS / Docker env_file) so Maya
  // redirectUrl uses https://yourdomain.com even when nginx proxies to localhost:3002.
  // NEXT_PUBLIC_APP_URL may be inlined at docker build time — avoid leaving it as localhost in prod images.
  const configuredUrl =
    cleanEnvValue(process.env.APP_URL) || cleanEnvValue(process.env.NEXT_PUBLIC_APP_URL)
  if (configuredUrl) return configuredUrl.replace(/\/+$/, '')

  const requestUrl = new URL(request.url)
  const forwardedProto =
    request.headers.get('x-forwarded-proto') || requestUrl.protocol.replace(':', '')
  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host')

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`.replace(/\/+$/, '')
  }

  return requestUrl.origin.replace(/\/+$/, '')
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const serviceRole = createServiceRoleClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const body = await request.json()
    const { items, billingInfo } = body
    const mayaPublicKey = getMayaPublicKey()
    const mayaCheckoutUrl = getMayaCheckoutUrl()

    if (!mayaPublicKey) {
      return NextResponse.json(
        { error: 'Payment gateway not configured. Set MAYA_PUBLIC_KEY (pk-...) in your env.' },
        { status: 500 }
      )
    }

    if (!mayaPublicKey.startsWith('pk-')) {
      return NextResponse.json(
        {
          error:
            'Maya Checkout requires a public key (pk-...). Set MAYA_PUBLIC_KEY, or replace MAYA_API_KEY with your pk-... key for this route.',
        },
        { status: 500 }
      )
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 })
    }

    if (user) {
      await ensurePublicUserRowForAuthUser(user)
    }

    const normalizedItems = items.map((item: any) => {
      const quantity = Math.max(1, Number(item.quantity) || 1)
      const unitPrice = Number(item.price) || 0
      const lineTotal = formatAmount(unitPrice * quantity)

      return {
        product_id: item.product_id,
        name: item.name || 'Product',
        price: formatAmount(unitPrice),
        quantity,
        maya: {
          name: item.name || 'Product',
          quantity: String(quantity),
          code: item.product_id || undefined,
          amount: {
            value: formatAmount(unitPrice),
          },
          totalAmount: {
            value: lineTotal,
          },
        },
      }
    })

    const cartTotals = calculateCartTotals(
      normalizedItems.map((item) => ({
        product_id: String(item.product_id || ''),
        quantity: item.quantity,
        price: item.price,
      }))
    )

    const totalValue = cartTotals.total
    if (!Number.isFinite(totalValue) || totalValue <= 0) {
      return NextResponse.json({ error: 'Invalid payment total' }, { status: 400 })
    }

    const clientTotal = Number(body.total)
    if (Number.isFinite(clientTotal) && Math.abs(clientTotal - totalValue) > 0.02) {
      console.warn('[create-intent] Client total mismatch; using server total', {
        clientTotal,
        serverTotal: totalValue,
      })
    }

    const normalizedBillingInfo = {
      firstName: cleanEnvValue(billingInfo?.firstName),
      lastName: cleanEnvValue(billingInfo?.lastName),
      email: cleanEnvValue(billingInfo?.email),
      phone: sanitizePhoneInput(cleanEnvValue(billingInfo?.phone)).trim(),
      address: cleanEnvValue(billingInfo?.address),
      city: cleanEnvValue(billingInfo?.city),
      zipCode: digitsOnly(billingInfo?.zipCode),
    }

    if (
      !normalizedBillingInfo.firstName ||
      !normalizedBillingInfo.lastName ||
      !normalizedBillingInfo.email ||
      !normalizedBillingInfo.phone ||
      !normalizedBillingInfo.zipCode
    ) {
      return NextResponse.json(
        { error: 'Missing required billing fields.' },
        { status: 400 }
      )
    }

    if (!EMAIL_REGEX.test(normalizedBillingInfo.email)) {
      return NextResponse.json(
        { error: 'Enter a valid email like name@gmail.com or name@company.com.' },
        { status: 400 }
      )
    }

    const normalizedBuyerPhone = normalizePhoneForGateway(normalizedBillingInfo.phone)
    if (!isValidPhone(normalizedBillingInfo.phone) || !normalizedBuyerPhone) {
      return NextResponse.json(
        {
          error:
            'Enter a valid phone number (7–15 digits). Include country code when outside PH (e.g. +1…).',
        },
        { status: 400 }
      )
    }

    if (!ZIP_CODE_REGEX.test(normalizedBillingInfo.zipCode)) {
      return NextResponse.json(
        { error: 'Postal code must be 4 to 10 digits.' },
        { status: 400 }
      )
    }

    const appUrl = getAppUrl(request)

    const mayaLineItems = normalizedItems.map((item) => item.maya)
    if (cartTotals.discountAmount > 0) {
      mayaLineItems.push({
        name: getBulkDiscountLabel(cartTotals.discountPercent),
        quantity: '1',
        code: 'BULK-DISCOUNT',
        amount: {
          value: formatAmount(-cartTotals.discountAmount),
        },
        totalAmount: {
          value: formatAmount(-cartTotals.discountAmount),
        },
      })
    }

    // Create MAYA checkout
    const paymentPayload = {
      requestReferenceNumber: `RRG-${Date.now()}`,
      totalAmount: {
        value: formatAmount(totalValue),
        currency: 'PHP',
      },
      buyer: buildMayaBuyer(normalizedBillingInfo, normalizedBuyerPhone, user),
      items: mayaLineItems,
      redirectUrl: {
        success: `${appUrl}/checkout/success`,
        failure: `${appUrl}/checkout/failed`,
        cancel: `${appUrl}/checkout/cancel`,
      },
      metadata: {
        userId: user?.id ?? null,
        isGuest: !user,
        type: 'ecommerce',
        billingInfo: normalizedBillingInfo,
        bulkDiscount: {
          uniqueProductCount: cartTotals.uniqueProductCount,
          discountPercent: cartTotals.discountPercent,
          discountAmount: cartTotals.discountAmount,
          subtotal: cartTotals.subtotal,
        },
      },
    }

    const response = await fetch(mayaCheckoutUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${mayaPublicKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorBody: unknown = errorText

      try {
        errorBody = JSON.parse(errorText)
      } catch {
        // Maya sometimes returns plain text; keep the raw body for logging.
      }

      const serializedErrorBody =
        typeof errorBody === 'string' ? errorBody : JSON.stringify(errorBody, null, 2)

      console.error(
        [
          'MAYA API Error',
          `status: ${response.status}`,
          `url: ${mayaCheckoutUrl}`,
          `payload: ${JSON.stringify(paymentPayload, null, 2)}`,
          `body: ${serializedErrorBody}`,
        ].join('\n')
      )

      const errorMessage =
        response.status === 401 || response.status === 403
          ? 'Maya rejected the checkout request. Use a MAYA public key (pk-...) and make sure the sandbox/production URL matches that key.'
          : 'Failed to create payment intent'

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Store payment record in database
    const { error: dbError } = await serviceRole.from('payments').insert({
      user_id: user?.id ?? null,
      amount: totalValue,
      currency: 'PHP',
      status: 'pending',
      payment_method: 'maya',
      external_id: data.checkoutId,
      metadata: {
        referenceNumber: paymentPayload.requestReferenceNumber,
        items: normalizedItems,
        billingInfo: normalizedBillingInfo,
        bulkDiscount: {
          uniqueProductCount: cartTotals.uniqueProductCount,
          discountPercent: cartTotals.discountPercent,
          discountAmount: cartTotals.discountAmount,
          subtotal: cartTotals.subtotal,
        },
      },
      response_data: {
        checkout: data,
      },
    })

    if (dbError) throw dbError

    return NextResponse.json({
      checkoutId: data.checkoutId,
      redirectUrl: data.redirectUrl,
    })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process payment' },
      { status: 500 }
    )
  }
}
