import Header from '@/components/header'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function FailedPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <XCircle className="w-20 h-20 text-destructive" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Payment Failed</h1>
            <p className="text-muted-foreground text-lg">
              Unfortunately, your payment could not be processed. Please try again with a different payment method.
            </p>
          </div>
          <div className="bg-destructive/10 rounded-lg p-4 text-left space-y-2">
            <p className="text-sm text-destructive font-medium">Common reasons:</p>
            <ul className="text-sm text-destructive list-disc list-inside space-y-1">
              <li>Insufficient funds</li>
              <li>Expired card</li>
              <li>Incorrect card details</li>
              <li>Transaction limit exceeded</li>
            </ul>
          </div>
          <div className="space-y-3 pt-4">
            <Link href="/checkout" className="block">
              <Button className="w-full bg-primary hover:bg-primary/90">Try Again</Button>
            </Link>
            <Link href="/cart" className="block">
              <Button variant="outline" className="w-full border-primary/20">
                Back to Cart
              </Button>
            </Link>
            <Link href="/support" className="block">
              <Button variant="outline" className="w-full border-primary/20">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
