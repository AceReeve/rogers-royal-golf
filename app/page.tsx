import Header from '@/components/header'
import HomeHero from '@/components/home-hero'
import PageLoader from '@/components/page-loader'
import SiteFooter from '@/components/site-footer'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plane, ShoppingBag, ShieldCheck, Truck, Star, Award, Target } from 'lucide-react'

const SHOW_ACTIVITIES = false

export default function Home() {
  return (
    <PageLoader>
      <div className="min-h-screen">
        <Header />

      <HomeHero>
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-6 motion-safe:duration-[2200ms]">
              <div>
                <div className="mb-4 inline-block rounded-full border border-primary/45 bg-primary/25 px-4 py-2 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-3 motion-safe:delay-200 motion-safe:duration-[1800ms]">
                  <span className="text-sm font-semibold text-white">Golf Goods, Activities, and Destinations</span>
                </div>
                <h1 className="text-balance text-5xl font-bold leading-tight text-white md:text-6xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-4 motion-safe:delay-300 motion-safe:duration-[2200ms]">
                  Discover Golf Experiences with <span className="text-secondary drop-shadow-lg">Roger's Royal Golf</span>
                </h1>
              </div>
              <p className="max-w-lg text-xl leading-relaxed text-white/90 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-3 motion-safe:delay-700 motion-safe:duration-[2200ms]">
                Explore golf activities and playable destinations, with support endorsed to a local accredited travel
                agency. Your shop stays ready with the golf products you already trust.
              </p>
              <div className="flex flex-col gap-4 pt-4 sm:flex-row motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-1000 motion-safe:duration-[2200ms]">
                {SHOW_ACTIVITIES ? (
                  <Link href="/tours">
                    <Button
                      size="lg"
                      className="w-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 sm:w-auto"
                    >
                      <Plane className="mr-2 h-5 w-5" />
                      Explore Activities
                    </Button>
                  </Link>
                ) : null}
                <Link href="/products">
                  <Button
                    size="lg"
                    className="w-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 sm:w-auto"
                  >
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Shop Products
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-6 motion-safe:delay-500 motion-safe:duration-[2200ms]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-primary/25 bg-primary/80 p-8 text-center backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:delay-700 motion-safe:duration-[1800ms]">
                  <div className="mb-2 text-4xl font-bold text-white">500+</div>
                  <p className="text-sm text-white/80">Golf Activities</p>
                </div>
                <div className="rounded-2xl border border-primary/25 bg-primary/80 p-8 text-center backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:delay-[1100ms] motion-safe:duration-[1800ms]">
                  <div className="mb-2 text-4xl font-bold text-white">10k+</div>
                  <p className="text-sm text-white/80">Golf Travelers</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-2xl border border-primary/25 bg-primary/80 p-8 text-center backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:delay-[900ms] motion-safe:duration-[1800ms]">
                  <div className="mb-2 text-4xl font-bold text-white">1000+</div>
                  <p className="text-sm text-white/80">Products</p>
                </div>
                <div className="rounded-2xl border border-primary/25 bg-primary/80 p-8 text-center backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:delay-[1300ms] motion-safe:duration-[1800ms]">
                  <div className="mb-2 text-4xl font-bold text-white">50+</div>
                  <p className="text-sm text-white/80">Golf Destinations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </HomeHero>

      {/* Features Section */}
      <section className="bg-primary/5 py-16 md:py-24 border-y border-primary/10 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:delay-[900ms] motion-safe:duration-[2000ms]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Roger's Royal Golf?</h2>
            <p className="text-lg text-muted-foreground">Built mostly for golfers shopping quality products and essentials</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-primary/10 hover:border-primary/30 transition-colors motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:delay-[1100ms] motion-safe:duration-[1600ms]">
              <CardHeader>
                <ShoppingBag className="w-8 h-8 text-secondary mb-2" />
                <CardTitle>Premium Golf Goods</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Shop golf equipment, accessories, and related items with clear line-by-line pricing in every listing.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="border-primary/10 hover:border-primary/30 transition-colors motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:delay-[1300ms] motion-safe:duration-[1600ms]">
              <CardHeader>
                <ShieldCheck className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Trusted Quality Options</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Choose from curated golf product lines focused on durable finishes, reliable specs, and practical use.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="border-primary/10 hover:border-primary/30 transition-colors motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:delay-[1500ms] motion-safe:duration-[1600ms]">
              <CardHeader>
                <Truck className="w-8 h-8 text-secondary mb-2" />
                <CardTitle>Stock & Support Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Get product availability updates and dependable support for orders and follow-ups.</CardDescription>
              </CardContent>
            </Card>
            {SHOW_ACTIVITIES ? (
              <Card className="border-primary/10 hover:border-primary/30 transition-colors">
                <CardHeader>
                  <Plane className="w-8 h-8 text-primary mb-2" />
                  <CardTitle>Golf Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Plan golf activities and hotel-ready packages with assistance endorsed to accredited partners.
                  </CardDescription>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </section>

      {/* Best Golf Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:delay-[1400ms] motion-safe:duration-[2000ms]">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Best Golf Products</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Popular picks golfers usually check first before heading to activities.
            </p>
          </div>
          <Link href="/products">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
              View All Products
            </Button>
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Card className="border-primary/10 hover:border-primary/30 transition-colors">
            <div className="relative h-44 w-full overflow-hidden rounded-t-xl">
              <Image src="/hero-2.png" alt="Golf products display" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Drivers
              </CardTitle>
              <CardDescription>Essential goods used for regular play and training.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/products?category=Drivers" className="text-primary text-sm font-medium hover:underline">
                Shop this category →
              </Link>
            </CardContent>
          </Card>

          <Card className="border-primary/10 hover:border-primary/30 transition-colors">
            <div className="relative h-44 w-full overflow-hidden rounded-t-xl">
              <Image src="/travel-hero.jpg" alt="Golf souvenirs and gift items" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-secondary" />
                Golf Balls
              </CardTitle>
              <CardDescription>Tour-grade and training-ready balls for distance and control.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/products?category=Golf+Balls" className="text-primary text-sm font-medium hover:underline">
                Shop this category →
              </Link>
            </CardContent>
          </Card>

          <Card className="border-primary/10 hover:border-primary/30 transition-colors">
            <div className="relative h-44 w-full overflow-hidden rounded-t-xl">
              <Image src="/hero-3.png" alt="Golf merchandise and accessories" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Distance Measuring Devices
              </CardTitle>
              <CardDescription>Accurate rangefinders and yardage tools for smarter shot decisions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/products?category=Distance+Measuring+Devices" className="text-primary text-sm font-medium hover:underline">
                Shop this category →
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Golf Product Highlights */}
      <section className="bg-secondary/5 border-y border-primary/10 py-16 md:py-20 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:delay-[1700ms] motion-safe:duration-[2000ms]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Features of Our Golf Products</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="relative h-48 overflow-hidden rounded-xl border border-primary/10">
              <Image src="/hero-2.png" alt="Golf product quality" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
            <div className="relative h-48 overflow-hidden rounded-xl border border-primary/10">
              <Image src="/travel-hero.jpg" alt="Golf product details and specs" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
            <div className="relative h-48 overflow-hidden rounded-xl border border-primary/10">
              <Image src="/hero-3.png" alt="Golf product support and stock" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-primary/10 bg-background p-5">
              <h3 className="font-semibold text-foreground">Reliable Build</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Product lines selected for durability and everyday golf use.
              </p>
            </div>
            <div className="rounded-xl border border-primary/10 bg-background p-5">
              <h3 className="font-semibold text-foreground">Clear Specs</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Straightforward listings with category, details, and pricing.
              </p>
            </div>
            <div className="rounded-xl border border-primary/10 bg-background p-5">
              <h3 className="font-semibold text-foreground">Ready Stock Focus</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Fast visibility of available items for planning and checkout.
              </p>
            </div>
            <div className="rounded-xl border border-primary/10 bg-background p-5">
              <h3 className="font-semibold text-foreground">Support Friendly</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Easy follow-up for inquiries, orders, and product clarifications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:delay-[2000ms] motion-safe:duration-[2200ms]">
        <div className="bg-gradient-to-r from-primary via-[#2d5a72] to-secondary rounded-2xl p-12 md:p-16 text-center text-primary-foreground shadow-lg">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Plan Your Next Golf Trip?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join golfers who trust Roger's Royal Golf for golf activities, destinations, and reliable support.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-[2300ms] motion-safe:duration-[1800ms]">
          <SiteFooter />
        </div>
      </div>
    </PageLoader>
  )
}
