import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OrderBillingDetails } from '@/components/order-billing-details'
import { ConfirmDeliveryForm } from '@/components/dashboard/confirm-delivery-form'
import { getOrderBillingSnapshot } from '@/lib/orders/billing-types'
import { getOrderItemProductName } from '@/lib/orders/order-item-display'
import { formatOrderStatusLabel, orderStatusBadgeClass } from '@/lib/orders/status'
import { createClient } from '@/lib/supabase/server'

export default async function OrdersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(id, quantity, price, product_name, products(name, image_url))
    `)
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
        <p className="text-muted-foreground mt-2">View and manage your product purchases</p>
      </div>

      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
                  <CardDescription>
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </CardDescription>
                </div>
                <Badge className={orderStatusBadgeClass(order.status)}>
                  {formatOrderStatusLabel(order.status)}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Order Items */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Items</h3>
                    <div className="space-y-2">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{getOrderItemProductName(item)}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <span className="font-semibold">₱{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-xl font-bold text-primary">₱{order.total_amount.toFixed(2)}</span>
                  </div>

                  <ConfirmDeliveryForm orderId={order.id} status={order.status} />

                  <OrderBillingDetails billing={getOrderBillingSnapshot(order)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-8 text-center">
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <a
              href="/products"
              className="inline-block px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Start Shopping
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
