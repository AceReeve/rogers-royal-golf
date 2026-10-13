/** Public title: prefer `name`, fall back to `destination`. */
export function tourDisplayName(tour: { name?: string | null; destination?: string | null }): string {
  const n = typeof tour.name === 'string' ? tour.name.trim() : ''
  if (n) return n
  const d = typeof tour.destination === 'string' ? tour.destination.trim() : ''
  return d || 'Tour'
}
