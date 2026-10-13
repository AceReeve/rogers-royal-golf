export const TOUR_CATEGORIES = [
  'Golf package',
  'Hotels',
] as const

export type TourCategory = (typeof TOUR_CATEGORIES)[number]

export const DEFAULT_TOUR_CATEGORY: TourCategory = 'Golf package'
