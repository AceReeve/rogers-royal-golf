import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit2, Plus, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/store'
import { DeleteCatalogButton } from '@/components/admin/delete-catalog-button'
import { tourUnitPrice } from '@/lib/tours/tour-price'
import { tourDisplayName } from '@/lib/tours/display-name'

export default async function AdminToursPage() {
  const supabase = await createClient()
  const storeId = await getStoreId()
  const { data: tours } = await supabase
    .from('tours')
    .select('*')
    .eq('store', storeId)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold">Tours</h1>
          <p className="text-muted-foreground mt-2">Manage your tour catalog</p>
        </div>
        <Link
          href="/admin/tours/new"
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Tour
        </Link>
      </div>

      {tours && tours.length > 0 ? (
        <div className="space-y-4">
          {tours.map((tour: any) => (
            <Card key={tour.id}>
              <div className="flex flex-col md:flex-row">
                {tour.image_url && (
                  <div className="bg-muted h-48 w-full flex-shrink-0 overflow-hidden rounded-l-lg md:w-48">
                    <img
                      src={tour.image_url}
                      alt={tourDisplayName(tour)}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle>{tourDisplayName(tour)}</CardTitle>
                      <CardDescription className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {tour.destination}
                        </span>
                        {tour.category ? (
                          <span className="text-primary font-medium">· {tour.category}</span>
                        ) : null}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-muted-foreground line-clamp-2 text-sm">{tour.description}</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Price / person</p>
                        <p className="font-bold">₱{tourUnitPrice(tour).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-bold">{tour.duration_days} days</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Max participants</p>
                        <p className="font-bold">{tour.max_participants}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 border-t pt-3">
                      <Link
                        href={`/admin/tours/${tour.id}/edit`}
                        className="border-primary text-primary hover:bg-primary/5 flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Link>
                      <DeleteCatalogButton kind="tour" id={tour.id} />
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-8 text-center">
            <p className="text-muted-foreground mb-4">No tours yet</p>
            <Link
              href="/admin/tours/new"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-block rounded-lg px-6 py-2 transition-colors"
            >
              Create First Tour
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
