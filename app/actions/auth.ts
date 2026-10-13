'use server'

import { revalidatePath } from 'next/cache'
import { fetchUserRoleForAdmin, isAdmin } from '@/lib/auth/is-admin'
import { createClient } from '@/lib/supabase/server'

export type AuthActionResult = { error: string } | { ok: true }

export async function signUp(formData: FormData): Promise<AuthActionResult> {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        display_name: formData.get('name') as string,
      },
    },
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function signIn(formData: FormData): Promise<AuthActionResult> {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/** For client UI: same rules as catalog/API (DB role + ADMIN_EMAILS, or JWT role + emails). */
export async function getIsAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const profile = await fetchUserRoleForAdmin(user.id)
  return isAdmin(user, profile)
}
