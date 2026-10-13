'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Package, AlertCircle } from 'lucide-react'
import { formatPeso } from '@/lib/currency/format'
import { addProductToCart } from '@/lib/cart/client-add-to-cart'

type ProductRow = {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  stock_quantity?: number | null
  stock?: number | null
}

export default function ProductDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [product, setProduct] = useState<ProductRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/products/${id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Product not found')
        if (!cancelled) setProduct(data.product)
      } catch (e) {
        if (!cancelled) {
          setProduct(null)
          setError(e instanceof Error ? e.message : 'Failed to load product')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  const stock = product ? product.stock ?? product.stock_quantity ?? 0 : 0

  const handleAddToCart = async () => {
    if (!product || stock < 1) return
    setAdding(true)
    setError(null)
    try {
      const qty = Math.min(quantity, stock)
      const result = await addProductToCart(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
        },
        qty
      )
      if (!result.ok) throw new Error(result.error)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading product…</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-foreground mb-2 text-2xl font-bold">Product not found</h2>
            <p className="text-muted-foreground mb-6">{error || 'This product is unavailable.'}</p>
            <Link href="/products">
              <Button className="bg-primary hover:bg-primary/90">Back to shop</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/products" className="text-primary hover:underline">
            ← Back to shop
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="relative h-96 overflow-hidden rounded-lg bg-muted">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full min-h-[384px] items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                <Package className="h-20 w-20 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <span className="mb-3 inline-block rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                {product.category}
              </span>
              <h1 className="text-foreground text-4xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
                {product.description || 'No description provided.'}
              </p>
            </div>

            <Card className="border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-primary text-3xl">
                  ₱{formatPeso(Number(product.price))}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive flex gap-2 rounded-md p-3 text-sm">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <p className="text-muted-foreground text-sm">
                  {stock > 0 ? (
                    <>
                      <span className="text-foreground font-semibold">{stock}</span> in stock
                    </>
                  ) : (
                    <span className="text-destructive font-medium">Out of stock</span>
                  )}
                </p>

                <div>
                  <label className="mb-2 block text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    min={1}
                    max={Math.max(1, stock)}
                    value={quantity}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10)
                      setQuantity(Number.isFinite(n) && n >= 1 ? Math.min(n, stock || 1) : 1)
                    }}
                    disabled={stock < 1}
                    className="border-primary/20 max-w-32"
                  />
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={adding || stock < 1}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
                  size="lg"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {adding ? 'Adding…' : 'Add to cart'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
