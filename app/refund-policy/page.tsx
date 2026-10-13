import type { Metadata } from 'next'
import MarketingDocLayout from '@/components/marketing-doc-layout'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Return, Refund & Cancellation policy | Roger's Royal Golf",
  description: 'Return, refund, and cancellation policy aligned with Philippine consumer protection.',
}

export default function RefundPolicyPage() {
  return (
    <MarketingDocLayout title="Return, Refund & Cancellation Policy" lastUpdated="April 21, 2026">
      <p>
        (In compliance with applicable Philippine consumer protection laws)
      </p>
      <p>
        This policy governs all purchases made through our online shopping mall, including golf equipment, tour
        packages, and general merchandise (gift items).
      </p>
      <p>
        We aim to ensure fair, transparent, and customer-friendly transactions in accordance with the Consumer Act of
        the Philippines (R.A. 7394) and related regulations.
      </p>

      <h2>1. Order Cancellation</h2>
      <p>
        <strong className="text-foreground">A. Physical Products (Golf &amp; General Merchandise)</strong>
      </p>
      <ul>
        <li>Orders may be canceled within 12 hours from confirmation or prior to shipment, whichever comes first.</li>
        <li>Once shipped, orders can no longer be canceled but may qualify for return (subject to conditions below).</li>
      </ul>
      <p>
        <strong className="text-foreground">B. Tour Packages &amp; Services</strong>
      </p>
      <ul>
        <li>&ge; 72 hours before schedule: Full refund</li>
        <li>48&ndash;72 hours before: 50% cancellation fee</li>
        <li>&lt; 48 hours or no-show: Non-refundable</li>
      </ul>

      <h2>2. Returns &amp; Exchanges</h2>
      <p>
        We accept returns in accordance with Philippine consumer rights, particularly for defective, damaged, or
        non-conforming goods.
      </p>
      <p>
        <strong className="text-foreground">A. Golf Equipment &amp; Accessories</strong>
      </p>
      <p>Returnable if:</p>
      <ul>
        <li>Requested within 7&ndash;14 days from delivery</li>
        <li>Item is unused, in original condition, and complete with packaging</li>
      </ul>
      <p>Non-returnable:</p>
      <ul>
        <li>Custom-fit or personalized golf clubs</li>
        <li>Used consumables (balls, gloves, etc.)</li>
        <li>Final sale or clearance items</li>
      </ul>
      <p>
        <strong className="text-foreground">B. General Merchandise (Gift Items)</strong>
      </p>
      <p>Returnable if:</p>
      <ul>
        <li>Requested within 7 days from receipt</li>
        <li>Item is unused, resalable, and in original packaging</li>
      </ul>
      <p>Non-returnable:</p>
      <ul>
        <li>Personalized or engraved items</li>
        <li>Perishable goods</li>
        <li>Opened hygiene-sensitive items</li>
        <li>Items marked Final Sale / Non-returnable</li>
      </ul>

      <h2>3. Consumer Protection Clause (DTI-Aligned)</h2>
      <p>In accordance with Philippine law, customers are entitled to remedies if products are:</p>
      <ul>
        <li>Defective</li>
        <li>Not as described</li>
        <li>Unfit for intended purpose</li>
      </ul>
      <p>In such cases, the customer may request:</p>
      <ul>
        <li>Repair</li>
        <li>Replacement</li>
        <li>Refund</li>
      </ul>
      <p>No return shipping fees will be charged for valid claims under this clause.</p>

      <h2>4. Return Process</h2>
      <ul>
        <li>Contact customer support within the allowed return period.</li>
        <li>Provide order number, description of issue, and photos/videos (if applicable).</li>
        <li>Wait for Return Authorization (RA).</li>
        <li>Ship item to designated address.</li>
      </ul>
      <p>Note: Unauthorized returns may be declined.</p>

      <h2>5. Refunds</h2>
      <ul>
        <li>Processed within 5&ndash;10 business days after inspection.</li>
        <li>Refunded via original payment method.</li>
      </ul>
      <p>Non-refundable:</p>
      <ul>
        <li>Original shipping fees (unless due to seller error)</li>
      </ul>
      <p>Partial refunds may apply if:</p>
      <ul>
        <li>Item is used, damaged, or incomplete upon return</li>
      </ul>

      <h2>6. Damaged, Defective, or Incorrect Orders</h2>
      <p>Report within 48 hours from delivery.</p>
      <p>We will:</p>
      <ul>
        <li>Cover return shipping costs</li>
        <li>Offer replacement or full refund, depending on availability</li>
      </ul>

      <h2>7. Exchanges</h2>
      <ul>
        <li>Allowed for eligible items, subject to stock availability</li>
        <li>If unavailable, a refund will be issued</li>
      </ul>

      <h2>8. Tour Rescheduling &amp; Force Majeure</h2>
      <ul>
        <li>Rescheduling allowed &ge; 72 hours before schedule, subject to availability.</li>
        <li>
          For events beyond control (e.g., weather, course closure, emergencies), tours may be rescheduled or
          refunded, at management discretion.
        </li>
      </ul>

      <h2>9. Limitation of Liability</h2>
      <p>The company shall not be liable for:</p>
      <ul>
        <li>Delays caused by courier services</li>
        <li>Force majeure events</li>
        <li>Improper use of purchased products</li>
      </ul>

      <h2>10. Contact Information</h2>
      <p>
        For concerns, complaints, or claims:
        <br />
        Email: <a href="mailto:info@rogersroyalgolf.com">info@rogersroyalgolf.com</a>
        <br />
        Phone: <a href="tel:+639566550111">+639566550111</a>
        <br />
        Business Hours: Mon. to Fri. 8am to 5pm (except holiday)
      </p>
      <p>You may also contact the Department of Trade and Industry (DTI) for unresolved consumer complaints.</p>

      <p>
        This policy is part of our overall <Link href="/company-policy">Terms &amp; Conditions</Link>. For data
        handling, see our <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>
    </MarketingDocLayout>
  )
}
