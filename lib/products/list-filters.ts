export type ProductListFilters = {
  search: string | null
  minPrice: number | null
  maxPrice: number | null
}

export function parseProductListFilters(searchParams: URLSearchParams): ProductListFilters {
  const search = searchParams.get('search')?.trim() || null
  const minRaw = searchParams.get('minPrice')?.trim()
  const maxRaw = searchParams.get('maxPrice')?.trim()

  const minPrice = minRaw ? parsePrice(minRaw) : null
  const maxPrice = maxRaw ? parsePrice(maxRaw) : null

  return {
    search,
    minPrice: minPrice != null && maxPrice != null && minPrice > maxPrice ? maxPrice : minPrice,
    maxPrice: minPrice != null && maxPrice != null && minPrice > maxPrice ? minPrice : maxPrice,
  }
}

function parsePrice(value: string): number | null {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) return null
  return n
}

type FilterableQuery = {
  ilike(column: string, pattern: string): FilterableQuery
  gte(column: string, value: number): FilterableQuery
  lte(column: string, value: number): FilterableQuery
}

export function applyProductListFilters<T extends FilterableQuery>(
  query: T,
  filters: ProductListFilters
): T {
  let next = query
  if (filters.search) {
    next = next.ilike('name', `%${filters.search}%`) as T
  }
  if (filters.minPrice != null) {
    next = next.gte('price', filters.minPrice) as T
  }
  if (filters.maxPrice != null) {
    next = next.lte('price', filters.maxPrice) as T
  }
  return next
}
