import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AdminProductForm } from '@/components/admin/product-form'

export default function NewProductPage() {
  return (
    <div>
      <Link
        href="/admin/products"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>
      <h1 className="text-foreground mb-2 text-3xl font-bold">Add product</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Items appear on the public shop after you save. You need admin role in{' '}
        <code className="text-xs">users</code>.
      </p>
      <AdminProductForm />
    </div>
  )
}
