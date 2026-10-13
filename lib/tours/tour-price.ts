/** Per-person tour price from DB (column is `price`; older schemas may use `price_per_person` or `base_price`). */
export type TourPriceFields = {
  price?: number | string | null
  price_per_person?: number | string | null
  base_price?: number | string | null
}

export function tourUnitPrice(tour: TourPriceFields | null | undefined): number {
  if (!tour) return 0
  const raw = tour.price ?? tour.price_per_person ?? tour.base_price
  if (raw == null || raw === '') return 0
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw))
  return Number.isFinite(n) ? n : 0
}
