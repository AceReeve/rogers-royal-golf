/**
 * Supports either Next-style public env or plain Supabase CLI / dashboard names.
 * Browser code still needs NEXT_PUBLIC_* — duplicate URL + anon key there for client auth.
 */
export function getSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    ''
  )
}

export function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    ''
  )
}

export function assertSupabaseEnv(): { url: string; anonKey: string } {
  const url = getSupabaseUrl()
  const anonKey = getSupabaseAnonKey()
  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase env: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (or SUPABASE_URL and SUPABASE_ANON_KEY for server-only), then restart the dev server.'
    )
  }
  return { url, anonKey }
}
