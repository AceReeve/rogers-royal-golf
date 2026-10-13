'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPeso } from '@/lib/currency/format'
import { emitCartUpdated } from '@/lib/cart/events'
import { loadCartItems, type CheckoutCartItem } from '@/lib/cart/load-cart'
import { calculateCartTotals, cartLinesFromCheckoutItems } from '@/lib/cart/cart-totals'
import { CartOrderSummary } from '@/components/cart-order-summary'
import {
  getGuestCartItems,
  removeGuestCartItem,
  updateGuestCartQuantity,
} from '@/lib/cart/guest-cart'

export default function CartPage() {
  const [items, setItems] = useState<CheckoutCartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const { items: loaded, isGuest: guest } = await loadCartItems()
      setItems(loaded)
      setIsGuest(guest)
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (item: CheckoutCartItem, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(item, item.quantity)
      return
    }

    if (isGuest) {
      updateGuestCartQuantity(item.product_id, newQuantity)
      emitCartUpdated(newQuantity - item.quantity)
      setItems(getGuestCartItems())
      return
    }

    try {
      const res = await fetch(`/api/cart/${item.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      })
      if (!res.ok) throw new Error('Failed to update quantity')
      emitCartUpdated(newQuantity - item.quantity)
      await fetchCart()
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const removeItem = async (item: CheckoutCartItem, currentQuantity: number) => {
    if (isGuest) {
      removeGuestCartItem(item.product_id)
      emitCartUpdated(-currentQuantity)
      setItems(getGuestCartItems())
      return
    }

    try {
      const res = await fetch(`/api/cart/${item.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to remove item')
      emitCartUpdated(-currentQuantity)
      await fetchCart()
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const totals = calculateCartTotals(cartLinesFromCheckoutItems(items))

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-muted-foreground">Loading cart...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>

        {isGuest && items.length > 0 ? (
          <p className="mb-6 rounded-md border border-primary/10 bg-primary/5 p-3 text-sm text-muted-foreground">
            Shopping as guest. You can checkout without an account — we&apos;ll email your receipt.
            {' '}
            <Link href="/auth/login" className="font-medium text-primary underline underline-offset-2">
              Sign in
            </Link>{' '}
            to track orders in your dashboard.
          </p>
        ) : null}

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Start shopping to add items to your cart</p>
            <Link href="/products">
              <Button className="bg-primary hover:bg-primary/90">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="border-primary/10">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {item.products?.image_url ? (
                          <Image
                            src={item.products.image_url}
                            alt={item.products.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{item.products?.name}</h3>
                        <p className="text-primary font-bold mb-3">
                          ₱{formatPeso(item.products?.price || 0)}
                        </p>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item, item.quantity - 1)}
                            className="p-1 hover:bg-muted rounded"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item, parseInt(e.target.value) || 1)
                            }
                            className="w-16 text-center border-primary/20"
                          />
                          <button
                            onClick={() => updateQuantity(item, item.quantity + 1)}
                            className="p-1 hover:bg-muted rounded"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeItem(item, item.quantity)}
                            className="ml-auto p-2 text-destructive hover:bg-destructive/10 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          ₱{formatPeso((item.products?.price || 0) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="border-primary/10 sticky top-20">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CartOrderSummary totals={totals} className="border-b border-primary/10 pb-4" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">₱{formatPeso(totals.total)}</span>
                  </div>

                  <Link href="/checkout" className="block w-full">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <Link href="/products" className="block w-full">
                    <Button variant="outline" className="w-full border-primary/20">
                      Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
