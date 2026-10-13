import { fetchUserRoleForAdmin, isAdmin } from '@/lib/auth/is-admin'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextResponse } from 'next/server'
import { CACHE_CONTROL } from '@/lib/http/cache-control'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('tour_dates')
      .select('*')
      .eq('tour_id', id)
      .gte('start_date', new Date().toISOString().split('T')[0])
      .order('start_date', { ascending: true })

    if (error) throw error

    return NextResponse.json(
      { dates: data },
      {
        headers: {
          'Cache-Control': CACHE_CONTROL.short,
        },
      }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tour dates' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
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
    const { start_date, end_date, available_slots } = body

    const db = createServiceRoleClient()
    const { data, error } = await db.from('tour_dates').insert({
      tour_id: id,
      start_date,
      end_date,
      available_slots,
    })

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create tour date' },
      { status: 500 }
    )
  }
}
