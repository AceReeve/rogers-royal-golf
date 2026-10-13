'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { formatPeso } from '@/lib/currency/format'
import { loadCartItems, type CheckoutCartItem } from '@/lib/cart/load-cart'
import { calculateCartTotals, cartLinesFromCheckoutItems } from '@/lib/cart/cart-totals'
import { CartOrderSummary } from '@/components/cart-order-summary'
import { PhoneCountryInput, DEFAULT_COUNTRY_CODE } from '@/components/phone-country-input'
import {
  combinePhoneWithCountry,
  isValidLocalPhone,
  PHONE_HINT,
} from '@/lib/phone'
import Link from 'next/link'

interface CartItem extends CheckoutCartItem {}

interface BillingInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  zipCode: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/
const ZIP_CODE_REGEX = /^\d{4,10}$/

function digitsOnly(value: string, maxLength?: number) {
  const digits = value.replace(/\D/g, '')
  return typeof maxLength === 'number' ? digits.slice(0, maxLength) : digits
}

function normalizeBillingInfo(
  info: BillingInfo,
  countryCode: string,
  localNumber: string
): BillingInfo {
  return {
    firstName: info.firstName.trim(),
    lastName: info.lastName.trim(),
    email: info.email.trim(),
    phone: combinePhoneWithCountry(countryCode, localNumber),
    address: info.address.trim(),
    city: info.city.trim(),
    zipCode: digitsOnly(info.zipCode, 10),
  }
}

function validateBillingInfo(
  info: BillingInfo,
  countryCode: string,
  localNumber: string
) {
  if (!info.firstName || !info.lastName || !info.email || !localNumber.trim() || !info.zipCode) {
    return 'Please fill in all required fields.'
  }

  if (!EMAIL_REGEX.test(info.email)) {
    return 'Enter a valid email like name@gmail.com or name@company.com.'
  }

  if (!isValidLocalPhone(localNumber, countryCode)) {
    return 'Enter a valid mobile number for the selected country code.'
  }

  if (!ZIP_CODE_REGEX.test(info.zipCode)) {
    return 'Postal code must be 4 to 10 digits.'
  }

  return null
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [phoneCountry, setPhoneCountry] = useState(DEFAULT_COUNTRY_CODE)
  const [phoneLocal, setPhoneLocal] = useState('')

  // Billing info
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
  })

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const { items, isGuest: guest } = await loadCartItems()
      setCartItems(items)
      setIsGuest(guest)
    } catch (err) {
      console.error('Error fetching cart:', err)
      setError('Failed to load cart items')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotals = () => {
    return calculateCartTotals(cartLinesFromCheckoutItems(cartItems))
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setError(null)

    try {
      const normalizedBillingInfo = normalizeBillingInfo(billingInfo, phoneCountry, phoneLocal)
      setBillingInfo(normalizedBillingInfo)

      const validationError = validateBillingInfo(
        normalizedBillingInfo,
        phoneCountry,
        phoneLocal
      )
      if (validationError) {
        throw new Error(validationError)
      }

      const totals = calculateTotals()

      if (totals.subtotal === 0) {
        throw new Error('Your cart is empty')
      }

      // Create payment intent
      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            name: item.products?.name || 'Product',
            quantity: item.quantity,
            price: item.products?.price || 0,
            product_id: item.product_id,
          })),
          total: totals.total,
          billingInfo: normalizedBillingInfo,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create payment')
      }

      const { redirectUrl, checkoutId } = await res.json()

      if (checkoutId && typeof checkoutId === 'string') {
        try {
          sessionStorage.setItem('uno_maya_checkout_id', checkoutId)
        } catch {
          /* storage unavailable */
        }
      }

      // Redirect to MAYA payment gateway
      if (redirectUrl) {
        window.location.href = redirectUrl
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-muted-foreground">Loading checkout...</p>
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add items before proceeding to checkout</p>
            <Button
              onClick={() => router.push('/products')}
              className="bg-primary hover:bg-primary/90"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const totals = calculateTotals()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

        {isGuest ? (
          <div className="mb-6 rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground">
            <p className="font-medium">Guest checkout</p>
            <p className="mt-1 text-muted-foreground">
              No account needed. After payment, <strong>save your order number</strong> — we&apos;ll
              also email your receipt to the address below.{' '}
              <Link href="/auth/login" className="text-primary underline underline-offset-2">
                Sign in
              </Link>{' '}
              if you want orders saved to your dashboard.
            </p>
          </div>
        ) : null}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Billing Form */}
          <div className="lg:col-span-2">
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckout} className="space-y-4">
                  {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-1">First Name *</label>
                      <Input
                        type="text"
                        required
                        value={billingInfo.firstName}
                        onChange={(e) =>
                          setBillingInfo({ ...billingInfo, firstName: e.target.value })
                        }
                        className="border-primary/20"
                        disabled={processing}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Last Name *</label>
                      <Input
                        type="text"
                        required
                        value={billingInfo.lastName}
                        onChange={(e) =>
                          setBillingInfo({ ...billingInfo, lastName: e.target.value })
                        }
                        className="border-primary/20"
                        disabled={processing}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1">Email *</label>
                    <Input
                      type="email"
                      required
                      inputMode="email"
                      placeholder="name@gmail.com"
                      value={billingInfo.email}
                      onChange={(e) =>
                        setBillingInfo({ ...billingInfo, email: e.target.value.trim() })
                      }
                      className="border-primary/20"
                      disabled={processing}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1">Phone *</label>
                    <PhoneCountryInput
                      countryCode={phoneCountry}
                      localNumber={phoneLocal}
                      onCountryChange={setPhoneCountry}
                      onLocalChange={setPhoneLocal}
                      disabled={processing}
                      required
                    />
                    <p className="mt-1 text-xs text-muted-foreground">{PHONE_HINT}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1">Address</label>
                    <Input
                      type="text"
                      value={billingInfo.address}
                      onChange={(e) =>
                        setBillingInfo({ ...billingInfo, address: e.target.value })
                      }
                      className="border-primary/20"
                      disabled={processing}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-1">City</label>
                      <Input
                        type="text"
                        value={billingInfo.city}
                        onChange={(e) =>
                          setBillingInfo({ ...billingInfo, city: e.target.value })
                        }
                        className="border-primary/20"
                        disabled={processing}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Postal Code *</label>
                      <Input
                        type="text"
                        required
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="1234"
                        value={billingInfo.zipCode}
                        onChange={(e) =>
                          setBillingInfo({
                            ...billingInfo,
                            zipCode: digitsOnly(e.target.value, 10),
                          })
                        }
                        className="border-primary/20"
                        disabled={processing}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {processing ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-primary/10 sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm py-1 border-b border-primary/5">
                      <span className="text-muted-foreground">
                        {item.products?.name} × {item.quantity}
                      </span>
                      <span>₱{formatPeso((item.products?.price || 0) * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-primary/10 pt-4">
                  <CartOrderSummary totals={totals} />
                </div>

                <div className="flex justify-between text-lg font-bold pt-2 border-t border-primary/10">
                  <span>Total</span>
                  <span className="text-primary">₱{formatPeso(totals.total)}</span>
                </div>

                {/* Payment Methods */}
                <div className="pt-4 border-t border-primary/10">
                  <p className="bg-primary/5 text-foreground border border-primary/10 rounded-md p-3 text-sm">
                    You will be redirected to Maya's secure checkout to complete your payment.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
