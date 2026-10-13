import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag, Plane, DollarSign, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/store'

export default async function DashboardPage() {
  const supabase = await createClient()
  const storeId = await getStoreId()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user stats
  const { data: orders } = await supabase
    .from('orders')
    .select('id, total_amount, created_at')
    .eq('user_id', user?.id)
    .eq('store', storeId)
    .order('created_at', { ascending: false })

  const { data: bookings } = await supabase
    .from('tour_bookings')
    .select('id')
    .eq('user_id', user?.id)

  const totalSpent = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
  const totalBookings = bookings?.length || 0
  const totalOrders = orders?.length || 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
        <p className="text-muted-foreground mt-2">Here&apos;s your activity overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Product purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tour Bookings</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">Upcoming tours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">In good standing</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest product purchases</CardDescription>
          </CardHeader>
          <CardContent>
            {orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 3).map((order, index) => {
                  const id = typeof order.id === 'string' ? order.id : ''
                  const label = id ? `#${id.slice(0, 8)}` : 'Order'
                  const created = order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'
                  const amount = Number(order.total_amount ?? 0)
                  return (
                    <div
                      key={id || `recent-order-${index}`}
                      className="flex items-center justify-between pb-4 border-b"
                    >
                      <div>
                        <p className="font-medium">Order {label}</p>
                        <p className="text-sm text-muted-foreground">{created}</p>
                      </div>
                      <span className="text-lg font-semibold">₱{amount.toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">No orders yet</p>
            )}
            <Link
              href="/dashboard/orders"
              className="mt-4 inline-block text-primary hover:underline"
            >
              View all orders →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Continue Shopping</CardTitle>
            <CardDescription>Explore more products and activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/products"
              className="block px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-center"
            >
              Browse Products
            </Link>
            <Link
              href="/tours"
              className="block px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/5 transition-colors text-center"
            >
              Explore Activities
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
