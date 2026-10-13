'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin, Users, Calendar } from 'lucide-react'
import { tourUnitPrice } from '@/lib/tours/tour-price'
import { tourDisplayName } from '@/lib/tours/display-name'
import { formatPeso } from '@/lib/currency/format'

interface TourCardProps {
  id: string
  name?: string | null
  destination: string
  category?: string | null
  description: string
  price?: number | null
  price_per_person?: number | null
  base_price?: number | null
  duration_days: number
  image_url: string
  max_participants: number
}

export default function TourCard({
  id,
  name,
  destination,
  category,
  description,
  price,
  price_per_person,
  base_price,
  duration_days,
  image_url,
  max_participants,
}: TourCardProps) {
  const unit = tourUnitPrice({ price, price_per_person, base_price })
  const title = tourDisplayName({ name, destination })
  return (
    <div className="bg-card rounded-lg border border-primary/10 overflow-hidden hover:border-primary/30 transition-colors group">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-muted h-48">
        {image_url ? (
          <Image
            src={image_url}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <MapPin className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-foreground">{title}</h3>
          {category ? (
            <p className="text-primary mt-0.5 text-xs font-medium uppercase tracking-wide">{category}</p>
          ) : null}
          {destination && destination !== title ? (
            <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3 shrink-0" />
              {destination}
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
        </div>

        {/* Tour Details */}
        <div className="space-y-2 pt-2 border-t border-primary/10">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">{duration_days} days</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Up to {max_participants} people</span>
          </div>
        </div>

        <div className="flex items-end justify-between pt-2">
          <div>
            <div className="text-2xl font-bold text-primary">₱{formatPeso(unit)}</div>
            <div className="text-xs text-muted-foreground">per person</div>
          </div>
        </div>

        <Link href={`/tours/${id}`} className="block w-full">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  )
}
