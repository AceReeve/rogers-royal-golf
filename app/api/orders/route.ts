import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { getStoreId } from '@/lib/store'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    const { userId, items, tourBookings, totalAmount, paymentId, status } = await request.json()

    if (!userId || (!items?.length && !tourBookings?.length)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Create order
    const store = await getStoreId(request)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: totalAmount,
        status: status || 'pending',
        payment_id: paymentId,
        store,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Add order items (products)
    if (items?.length > 0) {
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.name || item.product_name || 'Product',
        quantity: item.quantity,
        price: item.price,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError
    }

    // Add tour bookings
    if (tourBookings?.length > 0) {
      const bookings = tourBookings.map((booking: any) => ({
        user_id: userId,
        order_id: order.id,
        tour_id: booking.tour_id,
        tour_date_id: booking.tour_date_id,
        number_of_participants: booking.participants,
        total_price: booking.price,
        status: 'confirmed',
      }))

      const { error: bookingsError } = await supabase
        .from('tour_bookings')
        .insert(bookings)

      if (bookingsError) throw bookingsError
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    const { data } = await supabase.auth.getUser(token)

    if (!data.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const storeId = await getStoreId(request)
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(id, quantity, price, products(id, name, price, image_url)),
        tour_bookings(id, tour_id, number_of_participants, total_price, tours(id, name, destination, category, price))
      `)
      .eq('user_id', data.user.id)
      .eq('store', storeId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
