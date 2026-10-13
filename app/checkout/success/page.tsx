import { Suspense } from 'react'
import Header from '@/components/header'
import CheckoutSuccessContent from './success-content'
import { Loader2 } from 'lucide-react'

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Suspense
          fallback={
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
              <p className="text-muted-foreground mt-4">Loading…</p>
            </div>
          }
        >
          <CheckoutSuccessContent />
        </Suspense>
      </div>
    </div>
  )
}
