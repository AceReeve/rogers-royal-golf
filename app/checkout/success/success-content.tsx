'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2, AlertCircle, Copy } from 'lucide-react'
import { clearGuestCart } from '@/lib/cart/guest-cart'
import { emitCartUpdated } from '@/lib/cart/events'

const STORAGE_KEY = 'uno_maya_checkout_id'

type FinalizeResult = {
  orderNumber?: string | null
  referenceNumber?: string | null
  isGuest?: boolean
}

export default function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState<string | null>(null)
  const [result, setResult] = useState<FinalizeResult>({})
  const [copied, setCopied] = useState(false)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const fromQuery = searchParams.get('checkoutId')?.trim()
    let checkoutId = fromQuery || ''
    if (!checkoutId) {
      try {
        checkoutId = sessionStorage.getItem(STORAGE_KEY)?.trim() || ''
      } catch {
        /* ignore */
      }
    }

    const finalize = async () => {
      try {
        const res = await fetch('/api/payments/complete-success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ checkoutId: checkoutId || undefined }),
        })
        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          setPhase('error')
          setMessage(typeof data.error === 'string' ? data.error : 'Could not finalize your order.')
          return
        }

        try {
          sessionStorage.removeItem(STORAGE_KEY)
        } catch {
          /* ignore */
        }

        clearGuestCart()
        emitCartUpdated(0)

        setResult({
          orderNumber: data.orderNumber ?? null,
          referenceNumber: data.referenceNumber ?? null,
          isGuest: Boolean(data.isGuest),
        })
        setPhase('ready')
      } catch {
        setPhase('error')
        setMessage('Network error while finalizing your order.')
      }
    }

    void finalize()
  }, [searchParams])

  const copyOrderNumber = async () => {
    if (!result.orderNumber) return
    try {
      await navigator.clipboard.writeText(result.orderNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  if (phase === 'loading') {
    return (
      <div className="text-center space-y-4 py-8">
        <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
        <p className="text-muted-foreground">Saving your order…</p>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="text-center space-y-4 py-4">
        <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Could not confirm order</h1>
        <p className="text-muted-foreground text-sm px-2">{message}</p>
        {/maya|sk-|verify|secret/i.test(message || '') ? (
          <p className="text-xs text-muted-foreground px-2">
            Set <code className="text-foreground">MAYA_SECRET_KEY</code> (sk-…) on the server so we can verify payment
            with Maya after redirect. Webhooks can still complete the order in the background.
          </p>
        ) : null}
        <div className="space-y-3 pt-4">
          <Link href="/products" className="block">
            <Button className="w-full bg-primary hover:bg-primary/90">Continue shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle className="w-20 h-20 text-green-500" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Payment successful</h1>
        <p className="text-muted-foreground text-lg">
          Thank you for your order. Your payment has been processed successfully.
        </p>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 text-left space-y-3">
        <p className="text-sm font-semibold text-foreground">Save your transaction details</p>
        {result.orderNumber ? (
          <div className="flex items-center justify-between gap-3 rounded-md bg-background p-3 border border-primary/10">
            <div>
              <p className="text-xs text-muted-foreground">Order number</p>
              <p className="font-mono text-lg font-bold text-primary">{result.orderNumber}</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={copyOrderNumber}>
              <Copy className="w-4 h-4 mr-1" />
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        ) : null}
        {result.referenceNumber ? (
          <p className="text-sm text-muted-foreground">
            Payment reference: <span className="font-mono text-foreground">{result.referenceNumber}</span>
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {result.isGuest
            ? "We sent a confirmation email with these details. Keep your order number — you'll need it to follow up on delivery."
            : 'A confirmation email was sent. You can also track this order in your dashboard.'}
        </p>
      </div>

      <div className="space-y-3 pt-4">
        {result.isGuest ? (
          <>
            <Link href="/auth/signup" className="block">
              <Button variant="outline" className="w-full border-primary/20">
                Create an account to track future orders
              </Button>
            </Link>
            <Link href="/products" className="block">
              <Button className="w-full bg-primary hover:bg-primary/90">Continue shopping</Button>
            </Link>
          </>
        ) : (
          <>
            <Link href="/dashboard/orders" className="block">
              <Button className="w-full bg-primary hover:bg-primary/90">View your orders</Button>
            </Link>
            <Link href="/products" className="block">
              <Button variant="outline" className="w-full border-primary/20">
                Continue shopping
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
