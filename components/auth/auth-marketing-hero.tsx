import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

const MARKETING_IMAGE = '/golf-marketing.png'

/**
 * Centered auth shell: marketing image above the form card (sign-in / sign-up).
 */
export function AuthMarketingHero({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-muted px-4 py-10 sm:py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <Link
          href="/"
          className="flex w-full justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Roger's Royal Golf home"
        >
          <Image
            src={MARKETING_IMAGE}
            alt="Roger's Royal Golf"
            width={640}
            height={427}
            sizes="(max-width: 448px) 88vw, 400px"
            className="h-auto w-full max-w-[280px] object-contain sm:max-w-[320px]"
            priority
          />
        </Link>
        <div className="w-full">{children}</div>
      </div>
    </div>
  )
}
