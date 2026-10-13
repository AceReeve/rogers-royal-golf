import type { Metadata } from 'next'
import MarketingDocLayout from '@/components/marketing-doc-layout'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Privacy policy | Roger's Royal Golf",
  description: 'Privacy policy aligned with the Data Privacy Act of 2012 (R.A. 10173).',
}

export default function PrivacyPolicyPage() {
  return (
    <MarketingDocLayout title="Privacy Policy" lastUpdated="April 21, 2026">
      <p>
        We comply with the Data Privacy Act of 2012 (R.A. 10173).
      </p>

      <h2>1. Data Collection</h2>
      <p>We collect personal and transaction information.</p>

      <h2>2. Use of Data</h2>
      <p>Used for processing orders and improving services.</p>

      <h2>3. Protection</h2>
      <p>We implement security safeguards.</p>

      <h2>4. Rights</h2>
      <p>Users may request access, correction, or deletion of data.</p>

      <p>
        This privacy policy is part of our <Link href="/company-policy">Terms &amp; Conditions</Link> and should be
        read together with our <Link href="/refund-policy">Return, Refund &amp; Cancellation Policy</Link>.
      </p>
    </MarketingDocLayout>
  )
}
