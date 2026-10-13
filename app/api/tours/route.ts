import { fetchUserRoleForAdmin, isAdmin } from '@/lib/auth/is-admin'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextResponse } from 'next/server'
import { DEFAULT_TOUR_CATEGORY } from '@/lib/tours/constants'
import { CACHE_CONTROL } from '@/lib/http/cache-control'

export async function GET(request: Request) {
  const supabase = await createClient()

  try {
    const { searchParams } = new URL(request.url)
    const destination = searchParams.get('destination')
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 12

    let query = supabase.from('tours').select('*')

    if (destination) {
      query = query.ilike('destination', `%${destination}%`)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (minPrice) {
      query = query.gte('price', parseInt(minPrice))
    }

    if (maxPrice) {
      query = query.lte('price', parseInt(maxPrice))
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) throw error

    return NextResponse.json(
      {
        tours: data,
        total: count,
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
      { error: error instanceof Error ? error.message : 'Failed to fetch tours' },
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
    const { destination, description, duration_days, image_url, max_participants } = body
    const price = body.price ?? body.price_per_person
    const name = (typeof body.name === 'string' && body.name.trim()) || destination
    const category =
      typeof body.category === 'string' && body.category.trim()
        ? body.category.trim()
        : DEFAULT_TOUR_CATEGORY

    const db = createServiceRoleClient()
    const { data, error } = await db.from('tours').insert({
      name,
      destination,
      category,
      description,
      price,
      duration_days,
      image_url,
      max_participants,
    })

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create tour' },
      { status: 500 }
    )
  }
}
