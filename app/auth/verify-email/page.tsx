import Link from 'next/link'
import { AuthMarketingHero } from '@/components/auth/auth-marketing-hero'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerifyEmailPage() {
  return (
    <AuthMarketingHero>
      <Card className="w-full border-2 border-primary/10">
        <CardHeader className="space-y-1">
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a confirmation link to your address. Open it to activate your account, then sign
            in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you do not see the message, check spam or promotions. You can close this tab and return
            after confirming.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </AuthMarketingHero>
  )
}
