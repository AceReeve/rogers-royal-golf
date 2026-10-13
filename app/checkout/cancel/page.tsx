import Header from '@/components/header'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <AlertCircle className="w-20 h-20 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Payment Cancelled</h1>
            <p className="text-muted-foreground text-lg">
              Your payment has been cancelled. Your cart items are still saved.
            </p>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-4 text-left">
            <p className="text-sm text-muted-foreground">
              You can resume checkout at any time. Your items will remain in your cart for 30 days.
            </p>
          </div>
          <div className="space-y-3 pt-4">
            <Link href="/checkout" className="block">
              <Button className="w-full bg-primary hover:bg-primary/90">Resume Checkout</Button>
            </Link>
            <Link href="/cart" className="block">
              <Button variant="outline" className="w-full border-primary/20">
                Back to Cart
              </Button>
            </Link>
            <Link href="/products" className="block">
              <Button variant="outline" className="w-full border-primary/20">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
