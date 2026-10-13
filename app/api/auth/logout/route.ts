import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { assertSupabaseEnv } from '@/lib/supabase/env'

/**
 * Clears Supabase auth cookies and redirects home.
 * Dashboard/admin sidebars POST here; the header uses the same endpoint via fetch.
 */
export async function POST(request: Request) {
  const { url, anonKey } = assertSupabaseEnv()
  const origin = new URL(request.url).origin
  const redirect = NextResponse.redirect(new URL('/', origin), 302)

  const cookieStore = await cookies()

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          redirect.cookies.set(name, value, options)
        })
      },
    },
  })

  await supabase.auth.signOut()
  return redirect
}
