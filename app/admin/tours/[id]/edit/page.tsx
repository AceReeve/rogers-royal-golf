import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AdminTourForm } from '@/components/admin/tour-form'

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: tour } = await supabase.from('tours').select('*').eq('id', id).maybeSingle()

  if (!tour) notFound()

  return (
    <div>
      <Link
        href="/admin/tours"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tours
      </Link>
      <h1 className="text-foreground mb-8 text-3xl font-bold">Edit tour</h1>
      <AdminTourForm tour={tour} />
    </div>
  )
}
