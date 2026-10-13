import { fetchUserRoleForAdmin, isAdmin } from '@/lib/auth/is-admin'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextResponse } from 'next/server'
import { CACHE_CONTROL } from '@/lib/http/cache-control'
import { PRODUCT_CATEGORY_ORDER } from '@/lib/products/category-order'
import {
  applyProductListFilters,
  parseProductListFilters,
  type ProductListFilters,
} from '@/lib/products/list-filters'

type ProductRow = {
  id: string
  category?: string | null
  created_at?: string | null
  [key: string]: unknown
}

async function countProductsInCategory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  category: string,
  filters: ProductListFilters
): Promise<number> {
  let query = supabase.from('products').select('id', { count: 'exact', head: true }).eq('category', category)
  query = applyProductListFilters(query, filters)
  const { count, error } = await query
  if (error) throw error
  return count ?? 0
}

async function fetchProductsInCategory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  category: string,
  filters: ProductListFilters,
  from: number,
  to: number
): Promise<ProductRow[]> {
  let query = supabase.from('products').select('*').eq('category', category)
  query = applyProductListFilters(query, filters)
  const { data, error } = await query.order('created_at', { ascending: false }).range(from, to)
  if (error) throw error
  return (data ?? []) as ProductRow[]
}

async function countUncategorizedProducts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  filters: ProductListFilters
): Promise<number> {
  let query = supabase.from('products').select('id', { count: 'exact', head: true })
  for (const category of PRODUCT_CATEGORY_ORDER) {
    query = query.neq('category', category)
  }
  query = applyProductListFilters(query, filters)
  const { count, error } = await query
  if (error) throw error
  return count ?? 0
}

async function fetchUncategorizedProducts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  filters: ProductListFilters,
  from: number,
  to: number
): Promise<ProductRow[]> {
  let query = supabase.from('products').select('*')
  for (const category of PRODUCT_CATEGORY_ORDER) {
    query = query.neq('category', category)
  }
  query = applyProductListFilters(query, filters)
  const { data, error } = await query.order('created_at', { ascending: false }).range(from, to)
  if (error) throw error
  return (data ?? []) as ProductRow[]
}

async function fetchAllProductsByCategoryPriority(
  supabase: Awaited<ReturnType<typeof createClient>>,
  filters: ProductListFilters,
  page: number,
  limit: number
): Promise<{ products: ProductRow[]; total: number }> {
  const categoryCounts = await Promise.all(
    PRODUCT_CATEGORY_ORDER.map(async (category) => ({
      category,
      count: await countProductsInCategory(supabase, category, filters),
    }))
  )

  const otherCount = await countUncategorizedProducts(supabase, filters)
  const segments = [
    ...categoryCounts.map(({ category, count }) => ({ key: category, count })),
    { key: '__other__', count: otherCount },
  ]

  const total = segments.reduce((sum, segment) => sum + segment.count, 0)
  const offset = (page - 1) * limit
  const products: ProductRow[] = []
  let cursor = 0

  for (const segment of segments) {
    if (segment.count === 0) continue

    const segmentStart = cursor
    const segmentEnd = cursor + segment.count
    cursor = segmentEnd

    if (offset >= segmentEnd) continue
    if (products.length >= limit) break

    const sliceStart = Math.max(0, offset - segmentStart)
    const sliceEnd = Math.min(segment.count - 1, sliceStart + (limit - products.length) - 1)

    const batch =
      segment.key === '__other__'
        ? await fetchUncategorizedProducts(supabase, filters, sliceStart, sliceEnd)
        : await fetchProductsInCategory(supabase, segment.key, filters, sliceStart, sliceEnd)

    products.push(...batch)
  }

  return { products, total }
}

export async function GET(request: Request) {
  const supabase = await createClient()

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const filters = parseProductListFilters(searchParams)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = 12

    let products: ProductRow[] = []
    let total = 0

    if (category) {
      let query = supabase.from('products').select('*', { count: 'exact' }).eq('category', category)
      query = applyProductListFilters(query, filters)
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)
      if (error) throw error
      products = (data ?? []) as ProductRow[]
      total = count ?? 0
    } else {
      const result = await fetchAllProductsByCategoryPriority(supabase, filters, page, limit)
      products = result.products
      total = result.total
    }

    return NextResponse.json(
      {
        products,
        total,
        page,
        limit,
      },
      {
        headers: {
          'Cache-Control': CACHE_CONTROL.list,
        },
      }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch products' },
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await fetchUserRoleForAdmin(user.id)

    if (!isAdmin(user, profile)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, price, category, image_url, stock } = body

    const db = createServiceRoleClient()
    const { data, error } = await db.from('products').insert({
      name,
      description,
      price,
      category,
      image_url,
      stock_quantity: stock,
    })

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    )
  }
}
