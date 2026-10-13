import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { LogOut, Home, Package, Plane, BarChart3, Users } from 'lucide-react'
import { fetchUserRoleForAdmin, isAdmin } from '@/lib/auth/is-admin'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const profile = await fetchUserRoleForAdmin(user.id)

  if (!isAdmin(user, profile)) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="relative w-64 border-r border-border bg-card">
        <div className="p-6 border-b border-border space-y-2">
          <Link
            href="/"
            className="inline-block"
            aria-label="Roger's Royal Golf home"
          >
            <Image
              src="/roger-royal-golf-logo.svg"
              alt=""
              width={180}
              height={180}
              className="h-8 w-8 object-contain"
            />
          </Link>
          <p className="text-sm text-muted-foreground">Admin Panel</p>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-secondary/10 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-secondary/10 transition-colors"
          >
            <Package className="w-5 h-5" />
            <span>Products</span>
          </Link>

          <Link
            href="/admin/tours"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-secondary/10 transition-colors"
          >
            <Plane className="w-5 h-5" />
            <span>Tours</span>
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-secondary/10 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Orders</span>
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-secondary/10 transition-colors"
          >
            <Users className="w-5 h-5" />
            <span>Users</span>
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 w-52">
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-destructive/10 transition-colors text-destructive w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
