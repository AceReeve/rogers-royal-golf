'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Heart } from 'lucide-react'
import Link from 'next/link'
import { formatPeso } from '@/lib/currency/format'
import { addProductToCart } from '@/lib/cart/client-add-to-cart'

interface ProductCardProps {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  /** DB may use `stock` or `stock_quantity` */
  stock?: number | null
  stock_quantity?: number | null
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  image_url,
  category,
  stock,
  stock_quantity,
}: ProductCardProps) {
  const qty = stock ?? stock_quantity ?? 0
  const [loading, setLoading] = useState(false)
  const [liked, setLiked] = useState(false)
  const [cartHint, setCartHint] = useState<string | null>(null)

  const handleAddToCart = async () => {
    setLoading(true)
    setCartHint(null)
    try {
      const result = await addProductToCart(
        { id, name, price, image_url },
        1
      )

      if (!result.ok) {
        setCartHint(result.error)
        return
      }

      if (result.guest) {
        setCartHint('Added to cart. Sign in anytime to save orders to your dashboard.')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      setCartHint('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-lg border border-primary/10 overflow-hidden hover:border-primary/30 transition-colors group">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-muted h-48">
        {image_url ? (
          <Image
            src={image_url}
            alt={name}
            fill
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <span className="text-muted-foreground">No image</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setLiked(!liked)}
            className="bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-5 h-5 ${liked ? 'fill-destructive text-destructive' : 'text-foreground'}`}
            />
          </button>
        </div>
        {qty === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded mb-2">
            {category}
          </span>
          <h3 className="font-semibold text-foreground line-clamp-2">{name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold text-primary">₱{formatPeso(price)}</div>
            <div className="text-xs text-muted-foreground">{qty} in stock</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Link href={`/products/${id}`} className="block w-full">
            <Button variant="outline" className="w-full border-primary/20">
              View details
            </Button>
          </Link>
          <Button
            onClick={handleAddToCart}
            disabled={loading || qty === 0}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {loading ? 'Adding...' : 'Add to cart'}
          </Button>
        </div>
        {cartHint ? (
          <p className="text-xs leading-snug text-muted-foreground">{cartHint}</p>
        ) : null}
      </div>
    </div>
  )
}
