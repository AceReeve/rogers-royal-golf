'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/header'
import TourCard from '@/components/tour-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { TOUR_CATEGORIES } from '@/lib/tours/constants'

export default function ToursPage() {
  const [tours, setTours] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('All')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchTours()
  }, [page, search, category, minPrice, maxPrice])

  const fetchTours = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('destination', search)
      if (category !== 'All') params.append('category', category)
      if (minPrice) params.append('minPrice', minPrice)
      if (maxPrice) params.append('maxPrice', maxPrice)
      params.append('page', page.toString())

      const res = await fetch(`/api/tours?${params}`)
      const data = await res.json()
      setTours(data.tours || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Failed to fetch tours:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchTours()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-secondary to-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Golf Activities & Places</h1>
          <p className="text-lg opacity-90">
            Discover golf destinations, playable activities, and hotel-ready packages. Use the Hotels category to
            narrow your search.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search by golf place, club, or destination..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border-primary/20"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Search
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={category === 'All' ? 'default' : 'outline'}
                  className={category === 'All' ? 'bg-primary' : ''}
                  onClick={() => {
                    setCategory('All')
                    setPage(1)
                  }}
                >
                  All
                </Button>
                {TOUR_CATEGORIES.map((c) => (
                  <Button
                    key={c}
                    type="button"
                    size="sm"
                    variant={category === c ? 'default' : 'outline'}
                    className={category === c ? 'bg-primary' : ''}
                    onClick={() => {
                      setCategory(c)
                      setPage(1)
                    }}
                  >
                    {c}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Min Price (₱)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="border-primary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Max Price (₱)</label>
                <Input
                  type="number"
                  placeholder="100000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="border-primary/20"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Activities Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-muted-foreground">Loading activities...</p>
            </div>
          </div>
        ) : tours.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {tours.map((tour) => (
                <TourCard key={tour.id} {...tour} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 py-8">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outline"
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {Math.ceil(total / 12)}
              </span>
              <Button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 12 >= total}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No activities found</p>
          </div>
        )}
      </div>
    </div>
  )
}
