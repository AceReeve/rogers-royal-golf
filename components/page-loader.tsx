'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function PageLoader({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1600)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 rounded-full border-4 border-primary/25 border-t-primary animate-spin" />
            <div className="absolute inset-3 animate-spin [animation-direction:reverse] [animation-duration:2s]">
              <Image src="/roger-royal-golf-logo.svg" alt="Roger's Royal Golf" fill className="object-contain" priority />
            </div>
          </div>
          <p className="text-sm font-medium text-muted-foreground">Loading Roger's Royal Golf...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
