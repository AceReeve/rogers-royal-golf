import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const serviceRole = createServiceRoleClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tour_id, tour_date_id, participants } = body

    // Check availability
    const { data: tourDate } = await supabase
      .from('tour_dates')
      .select('available_slots, price, tour_id')
      .eq('id', tour_date_id)
      .single()

    if (!tourDate || tourDate.available_slots < participants) {
      return NextResponse.json(
        { error: 'Not enough available slots' },
        { status: 400 }
      )
    }

    // Create booking
    const resolvedTourId = tour_id || tourDate.tour_id
    const participantCount = Math.max(1, Number(participants) || 1)
    const totalPrice = Number(tourDate.price || 0) * participantCount

    const { data, error } = await serviceRole
      .from('tour_bookings')
      .insert({
        user_id: user.id,
        tour_id: resolvedTourId,
        tour_date_id,
        number_of_participants: participantCount,
        total_price: totalPrice,
        status: 'pending',
      })
      .select()

    if (error) throw error

    // Update available slots
    await serviceRole
      .from('tour_dates')
      .update({ available_slots: tourDate.available_slots - participantCount })
      .eq('id', tour_date_id)

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to book tour' },
      { status: 500 }
    )
  }
}
