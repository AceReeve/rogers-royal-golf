import type { User } from '@supabase/supabase-js'
import { createServiceRoleClient, getServiceRoleKey } from '@/lib/supabase/service-role'

/**
 * `cart_items.user_id` FK targets `public.users.id`, which must match `auth.users.id`.
 * Inserts a profile row only when missing (does not overwrite existing rows).
 */
export async function ensurePublicUserRowForAuthUser(user: User): Promise<void> {
  if (!getServiceRoleKey()) return
  if (!user.email) return

  try {
    const svc = createServiceRoleClient()
    const { data: exists } = await svc.from('users').select('id').eq('id', user.id).maybeSingle()
    if (exists) return

    const meta = user.user_metadata ?? {}
    const fullName =
      String(meta.display_name || meta.full_name || '').trim() ||
      user.email.split('@')[0] ||
      'Member'

    const base = {
      id: user.id,
      email: user.email,
      full_name: fullName || 'Member',
    }

    let { error } = await svc.from('users').insert({ ...base, role: 'customer' })
    if (error) {
      ;({ error } = await svc.from('users').insert(base))
    }

    if (error) console.error('[ensurePublicUserRowForAuthUser]', error.message)
  } catch (e) {
    console.error(
      '[ensurePublicUserRowForAuthUser] skipped:',
      e instanceof Error ? e.message : e
    )
  }
}
