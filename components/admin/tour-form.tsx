'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  createTourAction,
  updateTourAction,
  type CatalogFormState,
} from '@/app/actions/admin-catalog'
import { tourUnitPrice } from '@/lib/tours/tour-price'
import { DEFAULT_TOUR_CATEGORY, TOUR_CATEGORIES } from '@/lib/tours/constants'
import { tourDisplayName } from '@/lib/tours/display-name'
import { cn } from '@/lib/utils'

export type TourRow = {
  id: string
  name?: string | null
  destination: string
  category?: string | null
  description: string | null
  price?: number | null
  price_per_person?: number | null
  base_price?: number | null
  duration_days: number
  max_participants: number
  image_url: string | null
}

export function AdminTourForm({ tour }: { tour?: TourRow }) {
  const action = tour ? updateTourAction : createTourAction
  const [state, formAction, pending] = useActionState<CatalogFormState, FormData>(
    action,
    null
  )

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      {tour && <input type="hidden" name="id" value={tour.id} />}
      {state?.error && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Package name</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Palawan Island Escape"
          defaultValue={tour ? tourDisplayName(tour) : undefined}
        />
        <p className="text-muted-foreground text-xs">
          Shown on listings. Leave blank to use destination below.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="destination">Destination / region</Label>
        <Input
          id="destination"
          name="destination"
          required
          placeholder="e.g. El Nido, Palawan"
          defaultValue={tour?.destination}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          name="category"
          defaultValue={tour?.category?.trim() || DEFAULT_TOUR_CATEGORY}
          className={cn(
            'border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none',
          )}
        >
          {TOUR_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={tour?.description ?? ''}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="price">Price per person (₱)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={tour ? tourUnitPrice(tour) : undefined}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration_days">Duration (days)</Label>
          <Input
            id="duration_days"
            name="duration_days"
            type="number"
            min="1"
            required
            defaultValue={tour?.duration_days}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_participants">Max participants</Label>
          <Input
            id="max_participants"
            name="max_participants"
            type="number"
            min="1"
            required
            defaultValue={tour?.max_participants}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          name="image_url"
          type="url"
          placeholder="https://..."
          defaultValue={tour?.image_url ?? ''}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending} className="bg-primary">
          {pending ? 'Saving…' : tour ? 'Update tour' : 'Create tour'}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/tours">Cancel</Link>
        </Button>
      </div>
    </form>
  )
}
