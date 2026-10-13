'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MapPin, Users, Calendar, Clock, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { tourUnitPrice } from '@/lib/tours/tour-price'
import { tourDisplayName } from '@/lib/tours/display-name'
import { formatPeso } from '@/lib/currency/format'
import { emitCartUpdated } from '@/lib/cart/events'

interface TourDate {
  id: string
  start_date: string
  end_date: string
  available_slots: number
}

export default function TourDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [tour, setTour] = useState<any>(null)
  const [dates, setDates] = useState<TourDate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [participants, setParticipants] = useState(1)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTourDetails()
  }, [id])

  const fetchTourDetails = async () => {
    try {
      const tourRes = await fetch(`/api/tours/${id}`)
      const tourData = await tourRes.json()

      if (tourRes.ok && tourData.tour) {
        setTour(tourData.tour)
      } else {
        setTour(null)
      }

      // Fetch tour dates
      const datesRes = await fetch(`/api/tours/${id}/dates`)
      const datesData = await datesRes.json()
      const list = datesData.dates || []
      setDates(list)

      if (list.length > 0) {
        setSelectedDate(list[0].id)
      } else {
        setSelectedDate(null)
      }
    } catch (error) {
      console.error('Failed to fetch tour:', error)
      setError('Failed to load tour details')
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!selectedDate) {
      setError('Please select a tour date')
      return
    }

    setBooking(true)
    setError(null)

    try {
      const res = await fetch('/api/tours/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tour_id: id,
          tour_date_id: selectedDate,
          participants,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to book tour')
      }

      emitCartUpdated(participants)
      // Redirect to cart
      router.push('/cart')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book tour')
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-muted-foreground">Loading tour details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Activity not found</h2>
            <p className="text-muted-foreground mb-6">The activity you&apos;re looking for doesn&apos;t exist</p>
            <Link href="/tours">
              <Button className="bg-primary hover:bg-primary/90">Back to Activities</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const unitPrice = tourUnitPrice(tour)
  const title = tourDisplayName(tour)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/tours" className="text-primary hover:underline">
            ← Back to Activities
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative overflow-hidden rounded-lg h-96 bg-muted">
              {tour.image_url ? (
                <Image
                  src={tour.image_url}
                  alt={title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                  <MapPin className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Tour Info */}
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{title}</h1>
              {tour.category ? (
                <p className="text-primary mb-2 text-sm font-semibold uppercase tracking-wide">{tour.category}</p>
              ) : null}
              {tour.destination && tour.destination !== title ? (
                <p className="text-muted-foreground mb-4 flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {tour.destination}
                </p>
              ) : null}
              <p className="text-lg text-muted-foreground mb-6">{tour.description}</p>

              {/* Key Details */}
              <div className="grid grid-cols-3 gap-4 py-6 border-y border-primary/10">
                <div className="text-center">
                  <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="font-semibold">{tour.duration_days} Days</div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
                <div className="text-center">
                  <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="font-semibold">{tour.max_participants}</div>
                  <div className="text-sm text-muted-foreground">Max Size</div>
                </div>
                <div className="text-center">
                  <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="line-clamp-2 font-semibold">{tour.destination || '—'}</div>
                  <div className="text-sm text-muted-foreground">Destination</div>
                </div>
              </div>
            </div>

            {/* Itinerary */}
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>Tour Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Expert guided tour with experienced guides</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>All meals and accommodations included</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Transportation throughout the tour</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Travel insurance included</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Small group size for better experience</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-primary/10 sticky top-20">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">
                  ₱{formatPeso(unitPrice)}
                  <span className="text-sm text-muted-foreground">/person</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium block mb-2">Select a Date</label>
                  <select
                    value={selectedDate || ''}
                    onChange={(e) => setSelectedDate(e.target.value || null)}
                    className="w-full border border-primary/20 rounded-lg p-2 text-sm"
                  >
                    {dates.length === 0 ? (
                      <option value="">No upcoming dates</option>
                    ) : (
                      dates.map((date) => (
                        <option key={date.id} value={date.id}>
                          {new Date(date.start_date).toLocaleDateString()} -{' '}
                          {new Date(date.end_date).toLocaleDateString()} ({date.available_slots} slots)
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Number of Participants</label>
                  <Input
                    type="number"
                    min="1"
                    max={tour.max_participants}
                    value={participants}
                    onChange={(e) => setParticipants(parseInt(e.target.value) || 1)}
                    className="border-primary/20"
                  />
                </div>

                <div className="pt-4 border-t border-primary/10">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span>₱{formatPeso(unitPrice * participants)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">₱{formatPeso(unitPrice * participants)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleBooking}
                  disabled={booking || !selectedDate || dates.length === 0}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {booking ? 'Booking...' : 'Book Tour'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
