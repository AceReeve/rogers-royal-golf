'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { fetchUserRoleForAdmin, isAdmin } from '@/lib/auth/is-admin'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { DEFAULT_TOUR_CATEGORY } from '@/lib/tours/constants'
import { getStoreId } from '@/lib/store'

export type CatalogFormState = { error: string } | null

type AdminUser = { id: string }

async function requireAdmin(): Promise<{ user: AdminUser } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be signed in.' }
  }
  const profile = await fetchUserRoleForAdmin(user.id)

  if (!isAdmin(user, profile)) {
    return {
      error:
        'Admin access requires BOTH: (1) public.users.role = admin (or app_metadata.role = admin) AND (2) your sign-in email listed in ADMIN_EMAILS in .env.local (comma-separated). Restart dev after changing env.',
    }
  }
  return { user }
}

/** RLS often blocks catalog writes for the anon/authenticated role; service role is used only after requireAdmin(). */
function adminDb() {
  return createServiceRoleClient()
}

export async function createProductAction(
  _prev: CatalogFormState,
  formData: FormData
): Promise<CatalogFormState> {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || ''
  const price = parseFloat(String(formData.get('price')))
  const category = (formData.get('category') as string)?.trim() || 'Drivers'
  const image_url = (formData.get('image_url') as string)?.trim() || ''
  const stock = parseInt(String(formData.get('stock')), 10)

  if (!name || Number.isNaN(price) || Number.isNaN(stock)) {
    return { error: 'Name, price, and stock are required.' }
  }

  const store = await getStoreId()
  const { error } = await adminDb().from('products').insert({
    name,
    description,
    price,
    category,
    image_url: image_url || null,
    stock_quantity: stock,
    store,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/products')
  revalidatePath('/products')
  redirect('/admin/products')
}

export async function updateProductAction(
  _prev: CatalogFormState,
  formData: FormData
): Promise<CatalogFormState> {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  const id = formData.get('id') as string
  if (!id) return { error: 'Missing product id.' }

  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || ''
  const price = parseFloat(String(formData.get('price')))
  const category = (formData.get('category') as string)?.trim() || 'Drivers'
  const image_url = (formData.get('image_url') as string)?.trim() || ''
  const stock = parseInt(String(formData.get('stock')), 10)

  if (!name || Number.isNaN(price) || Number.isNaN(stock)) {
    return { error: 'Name, price, and stock are required.' }
  }

  const store = await getStoreId()
  const { error } = await adminDb()
    .from('products')
    .update({
      name,
      description,
      price,
      category,
      image_url: image_url || null,
      stock_quantity: stock,
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/products')
  revalidatePath('/products')
  redirect('/admin/products')
}

export async function deleteProductAction(id: string) {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  const db = adminDb()
  const { data: product } = await db.from('products').select('name').eq('id', id).maybeSingle()
  if (!product) {
    return { error: 'Product not found.' }
  }

  // Preserve name on historical order lines before the FK sets product_id to NULL.
  const { error: snapshotError } = await db
    .from('order_items')
    .update({ product_name: product.name })
    .eq('product_id', id)

  if (snapshotError) {
    return { error: snapshotError.message }
  }

  const { error } = await db.from('products').delete().eq('id', id)
  if (error) {
    return { error: error.message }
  }
  revalidatePath('/admin/products')
  revalidatePath('/products')
}

export async function createTourAction(
  _prev: CatalogFormState,
  formData: FormData
): Promise<CatalogFormState> {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  const destination = (formData.get('destination') as string)?.trim()
  const nameRaw = (formData.get('name') as string)?.trim()
  const name = nameRaw || destination || ''
  const description = (formData.get('description') as string)?.trim() || ''
  const category = (formData.get('category') as string)?.trim() || DEFAULT_TOUR_CATEGORY
  const rawPrice = formData.get('price') ?? formData.get('price_per_person')
  const price = parseFloat(String(rawPrice))
  const duration_days = parseInt(String(formData.get('duration_days')), 10)
  const max_participants = parseInt(String(formData.get('max_participants')), 10)
  const image_url = (formData.get('image_url') as string)?.trim() || ''

  if (
    !destination ||
    !name ||
    Number.isNaN(price) ||
    Number.isNaN(duration_days) ||
    Number.isNaN(max_participants)
  ) {
    return { error: 'Package name, destination, price, duration, and max participants are required.' }
  }

  const store = await getStoreId()
  const { error } = await adminDb().from('tours').insert({
    name,
    destination,
    category,
    description,
    price,
    duration_days,
    max_participants,
    image_url: image_url || null,
    store,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/tours')
  revalidatePath('/tours')
  redirect('/admin/tours')
}

export async function updateTourAction(
  _prev: CatalogFormState,
  formData: FormData
): Promise<CatalogFormState> {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  const id = formData.get('id') as string
  if (!id) return { error: 'Missing tour id.' }

  const destination = (formData.get('destination') as string)?.trim()
  const nameRaw = (formData.get('name') as string)?.trim()
  const name = nameRaw || destination || ''
  const description = (formData.get('description') as string)?.trim() || ''
  const category = (formData.get('category') as string)?.trim() || DEFAULT_TOUR_CATEGORY
  const rawPrice = formData.get('price') ?? formData.get('price_per_person')
  const price = parseFloat(String(rawPrice))
  const duration_days = parseInt(String(formData.get('duration_days')), 10)
  const max_participants = parseInt(String(formData.get('max_participants')), 10)
  const image_url = (formData.get('image_url') as string)?.trim() || ''

  if (
    !destination ||
    !name ||
    Number.isNaN(price) ||
    Number.isNaN(duration_days) ||
    Number.isNaN(max_participants)
  ) {
    return { error: 'Package name, destination, price, duration, and max participants are required.' }
  }

  const store = await getStoreId()
  const { error } = await adminDb()
    .from('tours')
    .update({
      name,
      destination,
      category,
      description,
      price,
      duration_days,
      max_participants,
      image_url: image_url || null,
    })
    .eq('id', id)
    .eq('store', store)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/tours')
  revalidatePath('/tours')
  redirect('/admin/tours')
}

export async function deleteTourAction(id: string) {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  const store = await getStoreId()
  const { error } = await adminDb().from('tours').delete().eq('id', id).eq('store', store)
  if (error) {
    return { error: error.message }
  }
  revalidatePath('/admin/tours')
  revalidatePath('/tours')
}
