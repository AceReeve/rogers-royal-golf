export function getOrderItemProductName(item: {
  product_name?: string | null
  products?: { name?: string | null } | null | Array<{ name?: string | null }>
}): string {
  const joined = Array.isArray(item.products) ? item.products[0] : item.products
  return joined?.name?.trim() || item.product_name?.trim() || 'Removed product'
}
