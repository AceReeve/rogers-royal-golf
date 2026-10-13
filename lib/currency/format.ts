const pesoFormatter = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatPeso(value: number): string {
  return pesoFormatter.format(Number(value) || 0)
}
