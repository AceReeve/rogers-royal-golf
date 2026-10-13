export const STORE_IDS = [
  'unotourph',
  'unoluxuryph',
  'unogadget',
  'hiphils',
  'unokbeautyph',
  'philss',
  'rogers-royal-golf',
] as const

export type StoreId = (typeof STORE_IDS)[number]

const DOMAIN_TO_STORE: Record<string, StoreId> = {
  'unotourph.com': 'unotourph',
  'www.unotourph.com': 'unotourph',
  'unotour.com': 'unotourph',
  'www.unotour.com': 'unotourph',
  'unoluxuryph.com': 'unoluxuryph',
  'www.unoluxuryph.com': 'unoluxuryph',
  'unogadgets.com': 'unogadget',
  'www.unogadgets.com': 'unogadget',
  'hiphils.com': 'hiphils',
  'www.hiphils.com': 'hiphils',
  'unokbeautyph.com': 'unokbeautyph',
  'www.unokbeautyph.com': 'unokbeautyph',
  'philss.com': 'philss',
  'www.philss.com': 'philss',
  'rogersroyalgolf.com': 'rogers-royal-golf',
  'www.rogersroyalgolf.com': 'rogers-royal-golf',
}

export function isStoreId(value: string | null | undefined): value is StoreId {
  return Boolean(value && (STORE_IDS as readonly string[]).includes(value))
}

function normalizeHost(host: string | null | undefined): string {
  return (host || '').split(',')[0].trim().toLowerCase().replace(/:\d+$/, '')
}

export function storeIdFromHost(host: string | null | undefined): StoreId | null {
  const hostname = normalizeHost(host)
  if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') return null
  if (DOMAIN_TO_STORE[hostname]) return DOMAIN_TO_STORE[hostname]
  const parts = hostname.split('.')
  if (parts.length > 2) {
    const root = parts.slice(-2).join('.')
    if (DOMAIN_TO_STORE[root]) return DOMAIN_TO_STORE[root]
  }
  return null
}

export function envStoreId(): StoreId | null {
  const raw = (process.env.NEXT_PUBLIC_STORE_ID || process.env.STORE_ID || '').trim()
  return isStoreId(raw) ? raw : null
}

export function resolveStoreId(host?: string | null): StoreId {
  return storeIdFromHost(host) || envStoreId() || 'unotourph'
}

/** Browser-safe store id from the current hostname, then NEXT_PUBLIC_STORE_ID. */
export function clientStoreId(): StoreId {
  const host = typeof window !== 'undefined' ? window.location.host : null
  return resolveStoreId(host)
}

export async function getStoreId(request?: Request): Promise<StoreId> {
  const requestHost = request?.headers.get('x-forwarded-host') || request?.headers.get('host')
  const fromRequest = storeIdFromHost(requestHost)
  if (fromRequest) return fromRequest

  try {
    const { headers } = await import('next/headers')
    const headerStore = await headers()
    const host = headerStore.get('x-forwarded-host') || headerStore.get('host')
    const fromHeaders = storeIdFromHost(host)
    if (fromHeaders) return fromHeaders
  } catch {
    // Not in a Next.js request context (scripts, etc.)
  }

  return envStoreId() || 'unotourph'
}

export function eqStore<T extends { eq: (column: string, value: string) => T }>(query: T, storeId: StoreId): T {
  return query.eq('store', storeId)
}
