import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { getSupabaseUrl } from '@/lib/supabase/env'

/**
 * Next/Turbopack sometimes does not expose non-NEXT_PUBLIC_ vars to server action
 * bundles; read .env.local from disk as a fallback (dev and production).
 */
function parseDotenvValue(raw: string): string {
  let v = raw.trim()
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1)
  }
  return v.trim()
}

function readEnvLocalVar(name: string): string | undefined {
  let dir = process.cwd()
  for (let i = 0; i < 8; i++) {
    const filePath = join(dir, '.env.local')
    if (existsSync(filePath)) {
      try {
        const content = readFileSync(filePath, 'utf8')
        for (const line of content.split(/\r?\n/)) {
          const trimmed = line.trim()
          if (!trimmed || trimmed.startsWith('#')) continue
          const unexported = trimmed.replace(/^export\s+/i, '')
          const eq = unexported.indexOf('=')
          if (eq === -1) continue
          const key = unexported.slice(0, eq).trim()
          if (key !== name) continue
          const val = parseDotenvValue(unexported.slice(eq + 1))
          if (val) return val
        }
      } catch {
        return undefined
      }
      return undefined
    }
    const parent = resolve(dir, '..')
    if (parent === dir) break
    dir = parent
  }
  return undefined
}

/** Resolves the service role JWT from `process.env` or `.env.local` (file fallback for Turbopack). */
export function getServiceRoleKey(): string {
  const fromEnv = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (fromEnv) return fromEnv
  return readEnvLocalVar('SUPABASE_SERVICE_ROLE_KEY')?.trim() ?? ''
}

/** Server-only: bypasses RLS. Use only in trusted API routes / webhooks. */
export function createServiceRoleClient() {
  const url = getSupabaseUrl()
  const key = getServiceRoleKey()

  if (!url && !key) {
    throw new Error(
      'Service client: set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in .env.local at the project root (same folder as package.json), then restart the dev server.'
    )
  }
  if (!url) {
    throw new Error(
      'Service client: Supabase URL is empty. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL in .env.local and restart the dev server.'
    )
  }
  if (!key) {
    throw new Error(
      `Service client: SUPABASE_SERVICE_ROLE_KEY is missing. cwd=${process.cwd()} — put it in .env.local next to package.json (quoted JWT values are fine), save the file, restart npm run dev.`
    )
  }

  return createClient(url, key)
}
