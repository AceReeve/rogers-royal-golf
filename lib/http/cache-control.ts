export const CACHE_CONTROL = {
  list: 'public, max-age=60, stale-while-revalidate=300',
  detail: 'public, max-age=120, stale-while-revalidate=600',
  short: 'public, max-age=30, stale-while-revalidate=120',
} as const
