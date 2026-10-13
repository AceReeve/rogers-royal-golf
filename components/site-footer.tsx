import Image from 'next/image'
import Link from 'next/link'

const SHOW_ACTIVITIES = false

export default function SiteFooter() {
  return (
    <footer className="border-t border-primary/10 bg-foreground/5 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="mb-4 inline-block" aria-label="Roger's Royal Golf home">
              <Image
                src="/roger-royal-golf-logo.svg"
                alt="Roger's Royal Golf"
                width={180}
                height={180}
                className="h-9 w-9 object-contain"
              />
            </Link>
            <p className="text-sm text-muted-foreground">Your trusted partner in golf, travel, and adventure.</p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-foreground">Explore</h4>
            <ul className="space-y-2 text-sm">
              {SHOW_ACTIVITIES ? (
                <li>
                  <Link href="/tours" className="text-muted-foreground hover:text-primary">
                    Activities
                  </Link>
                </li>
              ) : null}
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-primary">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary">
                  About us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-foreground">Policies</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/company-policy" className="text-muted-foreground hover:text-primary">
                  Company policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-muted-foreground hover:text-primary">
                  Refund policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">
                  Privacy policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-foreground">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="mailto:info@rogersroyalgolf.com" className="hover:text-primary">
                  info@rogersroyalgolf.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary/10 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ROGER&apos;S ROYAL GOLF INC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
