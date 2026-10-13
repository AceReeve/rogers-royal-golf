/** Minimum unique products before any bulk discount applies. */
export const BULK_DISCOUNT_MIN_UNIQUE = 5

/** +5% for every 5 additional unique products (5→5%, 10→10%, 15→15%, …). */
export const BULK_DISCOUNT_STEP = 5

/** Cap bulk discount at 25% (reached at 25+ unique products). */
export const BULK_DISCOUNT_MAX_PERCENT = 25

export function getBulkDiscountPercent(uniqueProductCount: number): number {
  if (uniqueProductCount < BULK_DISCOUNT_MIN_UNIQUE) return 0
  const tier = Math.floor(uniqueProductCount / BULK_DISCOUNT_STEP) * BULK_DISCOUNT_STEP
  return Math.min(tier, BULK_DISCOUNT_MAX_PERCENT)
}

export function getBulkDiscountLabel(percent: number): string {
  if (percent <= 0) return ''
  return `Bulk order discount (${percent}% off)`
}

export type BulkDiscountProgress = {
  uniqueProductCount: number
  currentPercent: number
  nextPercent: number
  productsNeeded: number
}

/** How many more unique products until the next discount tier (null if at max). */
export function getBulkDiscountProgress(uniqueProductCount: number): BulkDiscountProgress | null {
  const currentPercent = getBulkDiscountPercent(uniqueProductCount)
  if (currentPercent >= BULK_DISCOUNT_MAX_PERCENT) {
    return {
      uniqueProductCount,
      currentPercent,
      nextPercent: BULK_DISCOUNT_MAX_PERCENT,
      productsNeeded: 0,
    }
  }

  const nextTier =
    uniqueProductCount < BULK_DISCOUNT_MIN_UNIQUE
      ? BULK_DISCOUNT_MIN_UNIQUE
      : (Math.floor(uniqueProductCount / BULK_DISCOUNT_STEP) + 1) * BULK_DISCOUNT_STEP

  const nextPercent = Math.min(nextTier, BULK_DISCOUNT_MAX_PERCENT)
  const productsNeeded = Math.max(0, nextTier - uniqueProductCount)

  return {
    uniqueProductCount,
    currentPercent,
    nextPercent,
    productsNeeded,
  }
}

export function formatBulkDiscountHint(progress: BulkDiscountProgress | null): string | null {
  if (!progress) return null
  if (progress.currentPercent >= BULK_DISCOUNT_MAX_PERCENT) {
    return `You have the maximum ${BULK_DISCOUNT_MAX_PERCENT}% bulk discount (${progress.uniqueProductCount} different items).`
  }
  if (progress.productsNeeded === 0) return null
  if (progress.currentPercent === 0) {
    return `Add ${progress.productsNeeded} more different item${progress.productsNeeded === 1 ? '' : 's'} for ${progress.nextPercent}% off.`
  }
  return `Add ${progress.productsNeeded} more different item${progress.productsNeeded === 1 ? '' : 's'} to unlock ${progress.nextPercent}% off (currently ${progress.currentPercent}% off).`
}
