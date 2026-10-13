import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AdminTourForm } from '@/components/admin/tour-form'

export default function NewTourPage() {
  return (
    <div>
      <Link
        href="/admin/tours"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tours
      </Link>
      <h1 className="text-foreground mb-2 text-3xl font-bold">Add tour</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Tours show on the public tours page. You need admin role in{' '}
        <code className="text-xs">users</code>.
      </p>
      <AdminTourForm />
    </div>
  )
}
