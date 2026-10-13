import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { tourDisplayName } from '@/lib/tours/display-name'

export default async function BookingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: bookings } = await supabase
    .from('tour_bookings')
    .select(`
      *,
      tours(id, name, destination, category, description, price, image_url),
      tour_dates(id, start_date, end_date)
    `)
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
        <p className="text-muted-foreground mt-2">View and manage your tour reservations</p>
      </div>

      {bookings && bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking: any) => (
            <Card key={booking.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Tour Image */}
                {booking.tours?.image_url && (
                  <div className="w-full md:w-48 h-48 bg-muted flex-shrink-0">
                    <img
                      src={booking.tours.image_url}
                      alt={booking.tours ? tourDisplayName(booking.tours) : 'Tour'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Booking Details */}
                <div className="flex-1">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="flex-1">
                      <CardTitle className="text-xl">
                        {booking.tours ? tourDisplayName(booking.tours) : 'Tour'}
                      </CardTitle>
                      <CardDescription className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {booking.tours?.destination}
                        </span>
                        {booking.tours?.category ? (
                          <span className="text-primary font-medium">· {booking.tours.category}</span>
                        ) : null}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Check-in</p>
                        <p className="flex items-center gap-1 font-semibold">
                          <Calendar className="w-4 h-4" />
                          {new Date(booking.tour_dates?.start_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Check-out</p>
                        <p className="flex items-center gap-1 font-semibold">
                          <Calendar className="w-4 h-4" />
                          {new Date(booking.tour_dates?.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Participants</p>
                        <p className="flex items-center gap-1 font-semibold">
                          <Users className="w-4 h-4" />
                          {booking.number_of_participants}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-3 flex justify-between items-center">
                      <span className="text-muted-foreground">Total Price:</span>
                      <span className="text-lg font-bold text-primary">₱{booking.total_price.toFixed(2)}</span>
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
            <p className="text-muted-foreground mb-4">No bookings yet</p>
            <a
              href="/tours"
              className="inline-block px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Explore Activities
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
