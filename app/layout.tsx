import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Roger's Royal Golf - Travel & Shop",
  description: "Discover amazing activities and premium travel products. Book your next adventure with Roger's Royal Golf.",
  generator: 'v0.app',
  icons: {
    icon: '/roger-royal-golf-logo.svg',
    apple: '/roger-royal-golf-logo.svg',
    shortcut: '/roger-royal-golf-logo.svg',
  },
  openGraph: {
    title: "Roger's Royal Golf - Travel & Shop",
    description: 'Discover amazing activities and premium travel products',
    type: 'website',
    url: 'https://rogersroyalgolf.com',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
