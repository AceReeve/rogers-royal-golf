import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Edit2, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { DeleteCatalogButton } from '@/components/admin/delete-catalog-button'
import { formatPeso } from '@/lib/currency/format'

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-2">Manage your product catalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {products && products.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="w-14 p-3 font-medium" scope="col">
                  <span className="sr-only">Image</span>
                </th>
                <th className="p-3 font-medium" scope="col">
                  Product
                </th>
                <th className="w-36 p-3 font-medium" scope="col">
                  Category
                </th>
                <th className="w-28 p-3 text-right font-medium" scope="col">
                  Price
                </th>
                <th className="w-20 p-3 text-right font-medium" scope="col">
                  Stock
                </th>
                <th className="w-44 p-3 text-right font-medium" scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: any) => {
                const stock = product.stock ?? product.stock_quantity ?? 0
                return (
                  <tr
                    key={product.id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/25"
                  >
                    <td className="p-3 align-middle">
                      <div className="bg-muted relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border">
                        {product.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element -- arbitrary storage URLs in admin
                          <img
                            src={product.image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-muted-foreground absolute inset-0 flex items-center justify-center text-[10px]">
                            —
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="max-w-xs p-3 align-middle">
                      <p className="text-foreground font-medium leading-snug">{product.name}</p>
                      {product.description ? (
                        <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-relaxed">
                          {product.description}
                        </p>
                      ) : null}
                    </td>
                    <td className="p-3 align-middle">
                      <span className="text-foreground inline-block rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium">
                        {product.category || '—'}
                      </span>
                    </td>
                    <td className="p-3 align-middle text-right tabular-nums">
                      <span className="text-primary font-semibold">₱{formatPeso(Number(product.price))}</span>
                    </td>
                    <td className="p-3 align-middle text-right tabular-nums font-medium">{stock}</td>
                    <td className="p-3 align-middle">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="border-primary text-primary hover:bg-primary/5 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <DeleteCatalogButton kind="product" id={product.id} compact />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-8 text-center">
            <p className="text-muted-foreground mb-4">No products yet</p>
            <Link
              href="/admin/products/new"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-block rounded-lg px-6 py-2 transition-colors"
            >
              Create First Product
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
