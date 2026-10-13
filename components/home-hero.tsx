'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'

/**
 * Each slide can use a different image and focal point. Add entries (e.g. `/hero/beach-2.jpg`)
 * for a true multi-photo carousel like rajfitouts.
 */
const HERO_SLIDES: { src: string; imgClass: string }[] = [
  { src: '/golfbg.jpg', imgClass: 'object-cover object-center' },
  { src: '/hero-2.png', imgClass: 'object-cover object-[72%_center]' },
  { src: '/hero-3.png', imgClass: 'object-cover object-[28%_center]' },
]

const INTERVAL_MS = 3000

export default function HomeHero({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState(0)
  const count = HERO_SLIDES.length

  const goNext = useCallback(() => {
    setCurrent((i) => (i + 1) % count)
  }, [count])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return
    const timer = setInterval(goNext, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [goNext])

  return (
    <section className="relative flex min-h-[600px] items-center overflow-hidden md:min-h-[700px]">
      {HERO_SLIDES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={index !== current}
        >
          <Image
            src={slide.src}
            alt=""
            fill
            className={slide.imgClass}
            sizes="100vw"
            priority={index === 0}
          />
        </div>
      ))}

      <div className="absolute inset-0 z-[1] bg-black/50" aria-hidden />

      <div className="relative z-[2] w-full">{children}</div>

      <div
        className="absolute bottom-6 left-1/2 z-[3] flex -translate-x-1/2 gap-2"
        role="tablist"
        aria-label="Hero slides"
      >
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={index === current}
            aria-label={`Slide ${index + 1}`}
            onClick={() => setCurrent(index)}
            className={`rounded-full transition-all duration-300 ${
              index === current ? 'h-2.5 w-8 bg-white' : 'h-2.5 w-2.5 bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
