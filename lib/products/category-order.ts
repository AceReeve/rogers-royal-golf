/** Display order for shop "All" category — highest priority first. */
export const PRODUCT_CATEGORY_ORDER = [
  'Golf Sets/Package',
  'Golf Equipment',
  'Golf Bags',
  'Souvenirs & Gifts',
  'Drivers',
  'Iron Sets',
  'Golf Balls',
  'Golf Gloves',
  'Golf Umbrellas',
  'Distance Measuring Devices',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORY_ORDER)[number]

const categoryRank = new Map<string, number>(
  PRODUCT_CATEGORY_ORDER.map((category, index) => [category, index])
)

/** Lower rank = shown first in "All". Unknown categories sort last. */
export function getProductCategoryRank(category: string | null | undefined): number {
  if (!category) return PRODUCT_CATEGORY_ORDER.length
  const exact = categoryRank.get(category)
  if (exact !== undefined) return exact

  const normalized = category.trim().toLowerCase()
  for (const [name, rank] of categoryRank.entries()) {
    if (name.toLowerCase() === normalized) return rank
  }

  return PRODUCT_CATEGORY_ORDER.length + 1
}

export function compareProductsByCategoryPriority(
  a: { category?: string | null; created_at?: string | null },
  b: { category?: string | null; created_at?: string | null }
): number {
  const rankDiff = getProductCategoryRank(a.category) - getProductCategoryRank(b.category)
  if (rankDiff !== 0) return rankDiff

  const aTime = a.created_at ? Date.parse(a.created_at) : 0
  const bTime = b.created_at ? Date.parse(b.created_at) : 0
  return bTime - aTime
}

export const SHOP_CATEGORY_FILTERS = ['All', ...PRODUCT_CATEGORY_ORDER] as const
