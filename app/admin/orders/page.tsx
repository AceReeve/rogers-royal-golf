import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OrderBillingDetails } from '@/components/order-billing-details'
import { OrderStatusSelect } from '@/components/admin/order-status-select'
import { getOrderBillingSnapshot } from '@/lib/orders/billing-types'
import { getOrderItemProductName } from '@/lib/orders/order-item-display'
import { formatOrderStatusLabel, orderStatusBadgeClass } from '@/lib/orders/status'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export default async function AdminOrdersPage() {
  const supabase = createServiceRoleClient()
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      users(email, full_name),
      order_items(id, quantity, price, product_name, products(name))
    `)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground mt-2">View and manage all customer orders</p>
      </div>

      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Order #{order.order_number || order.id.slice(0, 8)}</CardTitle>
                  <CardDescription>
                    Customer:{' '}
                    {order.users?.full_name ||
                      order.users?.email ||
                      getOrderBillingSnapshot(order).email ||
                      'Guest'}
                    {order.users?.email || getOrderBillingSnapshot(order).email
                      ? ` (${order.users?.email || getOrderBillingSnapshot(order).email})`
                      : ''}
                  </CardDescription>
                </div>
                <Badge className={orderStatusBadgeClass(order.status)}>
                  {formatOrderStatusLabel(order.status)}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Order Date</p>
                    <p className="font-semibold">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Items</p>
                    <p className="font-semibold">{order.order_items?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment ID</p>
                    <p className="font-mono text-xs">{order.payment_id?.slice(0, 12) || '—'}...</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-bold text-primary">₱{Number(order.total_amount).toFixed(2)}</p>
                  </div>
                </div>

                <OrderStatusSelect orderId={order.id} currentStatus={order.status} />

                <div className="border-t pt-4">
                  <p className="text-sm font-semibold mb-2">Items</p>
                  <div className="space-y-1 text-sm">
                    {order.order_items?.map((item: any) => (
                      <p key={item.id} className="text-muted-foreground">
                        {getOrderItemProductName(item)} — Qty {item.quantity} × ₱
                        {Number(item.price).toFixed(2)}
                      </p>
                    ))}
                  </div>
                </div>

                <OrderBillingDetails
                  billing={getOrderBillingSnapshot(order)}
                  title="Customer billing (checkout)"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-8 text-center">
            <p className="text-muted-foreground">No orders yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
