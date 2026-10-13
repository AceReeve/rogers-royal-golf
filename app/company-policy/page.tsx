import type { Metadata } from 'next'
import MarketingDocLayout from '@/components/marketing-doc-layout'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Company policy | Roger's Royal Golf",
  description: 'Terms and conditions for golf products, merchandise, and tour packages.',
}

export default function CompanyPolicyPage() {
  return (
    <MarketingDocLayout title="Terms & Conditions" lastUpdated="April 21, 2026">
      <p>
        These Terms govern your use of our services including golf products, general merchandise, and tour packages. By
        using our platform, you agree to comply with these terms.
      </p>

      <h2>1. Use of Website</h2>
      <p>Use is limited to lawful purposes only.</p>

      <h2>2. Products &amp; Services</h2>
      <p>
        All offerings are subject to availability and may change without notice.
      </p>

      <h2>3. Pricing &amp; Payments</h2>
      <p>Prices are in PHP. Full payment is required before processing.</p>

      <h2>4. Limitation of Liability</h2>
      <p>
        We are not liable for indirect or consequential damages.
      </p>

      <h2>5. Governing Law</h2>
      <p>Governed by Philippine laws.</p>

      <p>
        For returns, refunds, and cancellations, please review our <Link href="/refund-policy">Return, Refund &amp;
        Cancellation Policy</Link>. For personal data handling, see our <Link href="/privacy-policy">Privacy
        Policy</Link>.
      </p>
    </MarketingDocLayout>
  )
}
