import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient, getServiceRoleKey } from '@/lib/supabase/service-role'

/** Row from public.users (or null if no row). */
export type UserProfileRoleRow = { role: string | null } | null

/**
 * Load `public.users.role` for admin checks. Uses the session client first; if that
 * returns no row (missing row or RLS), falls back to the service role when
 * `SUPABASE_SERVICE_ROLE_KEY` is set.
 */
export async function fetchUserRoleForAdmin(userId: string): Promise<UserProfileRoleRow> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  if (!error && data != null) {
    return data
  }

  if (!getServiceRoleKey()) {
    return null
  }

  try {
    const svc = createServiceRoleClient()
    const { data: svcData } = await svc.from('users').select('role').eq('id', userId).maybeSingle()
    return svcData ?? null
  } catch {
    return null
  }
}

function parseAdminEmails(): string[] {
  return (
    process.env.ADMIN_EMAILS?.split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean) ?? []
  )
}

/**
 * Admin requires BOTH:
 * 1) Role: `public.users.role === 'admin'` OR JWT `app_metadata.role === 'admin'`
 * 2) Email: sign-in email must appear in server env `ADMIN_EMAILS` (comma-separated)
 *
 * If `ADMIN_EMAILS` is missing or empty, no one is treated as admin (configure the list).
 */
function norm(s: string | null | undefined) {
  return (s ?? '').trim().toLowerCase()
}

export function isAdmin(user: User, profile: UserProfileRoleRow): boolean {
  const fromProfile = norm(profile?.role) === 'admin'
  const fromJwt =
    norm((user.app_metadata as { role?: string } | undefined)?.role) === 'admin'
  const hasRole = fromProfile || fromJwt

  const emails = parseAdminEmails()
  if (!hasRole || emails.length === 0) return false

  const email = norm(user.email)
  return !!email && emails.includes(email)
}
