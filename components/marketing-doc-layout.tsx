import Header from '@/components/header'
import SiteFooter from '@/components/site-footer'

type MarketingDocLayoutProps = {
  title: string
  lastUpdated?: string
  children: React.ReactNode
}

export default function MarketingDocLayout({
  title,
  lastUpdated,
  children,
}: MarketingDocLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 border-b border-primary/10">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">{title}</h1>
          {lastUpdated ? (
            <p className="mb-10 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          ) : (
            <div className="mb-10" />
          )}
          <div className="space-y-6 text-muted-foreground leading-relaxed [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:first:mt-0 [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline">
            {children}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
