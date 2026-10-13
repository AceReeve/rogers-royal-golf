'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getCurrentUser, getIsAdmin } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { CART_UPDATED_EVENT } from '@/lib/cart/events'
import { getGuestCartCount } from '@/lib/cart/guest-cart'

const SHOW_ACTIVITIES = false

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [admin, setAdmin] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    Promise.all([getCurrentUser(), getIsAdmin()]).then(([u, isAdm]) => {
      if (!cancelled) {
        setUser(u)
        setAdmin(isAdm)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const loadCartCount = async () => {
      try {
        if (!user) {
          if (!cancelled) setCartCount(getGuestCartCount())
          return
        }
        const res = await fetch('/api/cart', { credentials: 'include' })
        if (!res.ok) return
        const data = await res.json()
        const count = Array.isArray(data.items)
          ? data.items.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 0), 0)
          : 0
        if (!cancelled) setCartCount(count)
      } catch {
        if (!cancelled) setCartCount(user ? 0 : getGuestCartCount())
      }
    }
    loadCartCount()

    const onCartUpdated = (event: Event) => {
      const custom = event as CustomEvent<{ delta?: number }>
      const delta = custom.detail?.delta
      if (typeof delta === 'number' && Number.isFinite(delta) && delta !== 0) {
        setCartCount((prev) => Math.max(0, prev + delta))
      }
      loadCartCount()
    }

    window.addEventListener(CART_UPDATED_EVENT, onCartUpdated as EventListener)
    return () => {
      cancelled = true
      window.removeEventListener(CART_UPDATED_EVENT, onCartUpdated as EventListener)
    }
  }, [user])

  const handleSignOut = async () => {
    setMobileOpen(false)
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
        redirect: 'manual',
      })
      const loc = res.headers.get('Location')
      if ((res.status === 302 || res.status === 303 || res.status === 307) && loc) {
        window.location.assign(loc)
        return
      }
    } catch {
      // fall through
    }
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[4.5rem] items-center justify-between gap-4 py-2 md:min-h-[5.5rem] md:py-3">
          <Link
            href="/"
            className="group flex shrink-0 items-center"
            aria-label="Roger's Royal Golf home"
          >
            <Image
              src="/roger-royal-golf-logo.svg"
              alt=""
              width={256}
              height={256}
              className="h-14 w-14 object-contain opacity-95 transition-opacity group-hover:opacity-100 sm:h-16 sm:w-16 md:h-20 md:w-20"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-foreground hover:text-primary transition-colors">
              Shop
            </Link>
            {SHOW_ACTIVITIES ? (
              <Link href="/tours" className="text-foreground hover:text-primary transition-colors">
                Activities
              </Link>
            ) : null}
            <Link href="/about" className="text-foreground hover:text-primary transition-colors">
              About us
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 ? (
                  <span className="bg-primary text-primary-foreground absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold leading-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                ) : null}
              </Button>
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                {admin && (
                  <Link href="/admin">
                    <Button variant="default" size="sm" className="bg-primary">
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="border-primary/20 hover:bg-primary/5"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-primary/10">
            <Link href="/products" className="block px-4 py-2 hover:bg-muted rounded-lg">
              Shop
            </Link>
            {SHOW_ACTIVITIES ? (
              <Link href="/tours" className="block px-4 py-2 hover:bg-muted rounded-lg">
                Activities
              </Link>
            ) : null}
            <Link href="/about" className="block px-4 py-2 hover:bg-muted rounded-lg">
              About us
            </Link>
            <div className="px-4 space-y-2">
              <Link href="/cart" className="block">
                <Button variant="outline" size="sm" className="w-full justify-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Cart{cartCount > 0 ? ` (${cartCount > 99 ? '99+' : cartCount})` : ''}
                </Button>
              </Link>
              {user ? (
                <>
                  {admin && (
                    <Link href="/admin" className="block">
                      <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Link href="/dashboard" className="block">
                    <Button variant="ghost" size="sm" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block">
                    <Button variant="ghost" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup" className="block">
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
