'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  createProductAction,
  updateProductAction,
  type CatalogFormState,
} from '@/app/actions/admin-catalog'
import { PRODUCT_CATEGORY_ORDER } from '@/lib/products/category-order'

const CATEGORIES = [...PRODUCT_CATEGORY_ORDER]

export type ProductRow = {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  image_url: string | null
  stock?: number | null
  stock_quantity?: number | null
}

export function AdminProductForm({ product }: { product?: ProductRow }) {
  const action = product ? updateProductAction : createProductAction
  const [state, formAction, pending] = useActionState<CatalogFormState, FormData>(
    action,
    null
  )

  const stockVal = product?.stock ?? product?.stock_quantity ?? 0

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      {product && <input type="hidden" name="id" value={product.id} />}
      {state?.error && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required defaultValue={product?.name} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product?.description ?? ''}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Price (₱)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product?.price}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            required
            defaultValue={stockVal}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          name="category"
          defaultValue={product?.category || CATEGORIES[0]}
          className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          name="image_url"
          type="url"
          placeholder="https://..."
          defaultValue={product?.image_url ?? ''}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending} className="bg-primary">
          {pending ? 'Saving…' : product ? 'Update product' : 'Create product'}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/products">Cancel</Link>
        </Button>
      </div>
    </form>
  )
}
