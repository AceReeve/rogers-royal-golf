import { ensurePublicUserRowForAuthUser } from '@/lib/auth/ensure-public-user'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function parsePositiveInt(value: unknown, fallback = 1, max = 9999): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 1) return fallback
  return Math.min(Math.floor(n), max)
}

type ProductRow = {
  id: string
  price: number
  stock_quantity?: number | null
}

function productStock(p: ProductRow): number {
  return typeof p.stock_quantity === 'number' ? p.stock_quantity : 0
}

export async function GET() {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ items: [], isGuest: true })
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(id, name, price, image_url)')
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ items: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Sign in to add items to your cart.' },
        { status: 401 }
      )
    }

    await ensurePublicUserRowForAuthUser(user)

    const body = await request.json()
    const { product_id, quantity: rawQuantity } = body

    if (!product_id || typeof product_id !== 'string') {
      return NextResponse.json({ error: 'Missing product.' }, { status: 400 })
    }

    const quantity = parsePositiveInt(rawQuantity, 1)

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, price, stock_quantity')
      .eq('id', product_id)
      .maybeSingle()

    if (productError) throw productError
    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
    }

    const row = product as ProductRow
    const stock = productStock(row)
    if (stock < 1) {
      return NextResponse.json({ error: 'This product is out of stock.' }, { status: 400 })
    }

    const { data: existingItem, error: existingError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .maybeSingle()

    if (existingError) throw existingError

    const priceAtTime = Number(row.price)
    if (!Number.isFinite(priceAtTime)) {
      return NextResponse.json({ error: 'Invalid product price.' }, { status: 500 })
    }

    if (existingItem) {
      const nextQty = existingItem.quantity + quantity
      if (nextQty > stock) {
        return NextResponse.json(
          { error: `Only ${stock} available in stock.` },
          { status: 400 }
        )
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: nextQty })
        .eq('id', existingItem.id)
        .select()
        .maybeSingle()

      if (error) throw error
      return NextResponse.json(data)
    }

    if (quantity > stock) {
      return NextResponse.json(
        { error: `Only ${stock} available in stock.` },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        user_id: user.id,
        product_id,
        quantity,
        price_at_time: priceAtTime,
      })
      .select()
      .maybeSingle()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add to cart' },
      { status: 500 }
    )
  }
}
