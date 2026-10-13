import type { Metadata } from 'next'
import MarketingDocLayout from '@/components/marketing-doc-layout'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "About us | Roger's Royal Golf",
  description:
    "ROGER'S ROYAL GOLF INC.—golf equipment and travel-related retail, tours with assistance endorsed to accredited local travel agencies.",
}

export default function AboutPage() {
  return (
    <MarketingDocLayout title="About us">
      <h2>Company profile</h2>
      <ol>
        <li>
          <strong className="text-foreground">Greetings from the company</strong> — Welcome to{' '}
          <strong className="text-foreground">ROGER&apos;S ROYAL GOLF INC.</strong>
          We appreciate your trust and are committed to serving golfers, travelers, and families with reliable products
          and customer support.
        </li>
        <li>
          <strong className="text-foreground">Vision</strong> — To be a trusted golf lifestyle and travel company in
          the Philippines, known for quality products, transparent service, and dependable customer care.
        </li>
        <li>
          <strong className="text-foreground">Customer’s vision with our company</strong> — We aim to help every
          customer achieve a smooth, enjoyable golf journey by combining the right products, practical support, and
          accessible activities.
        </li>
      </ol>

      <p>
        <strong className="text-foreground">Roger&apos;s Royal Golf</strong> is the golf shop and travel brand of{' '}
        <strong className="text-foreground">ROGER&apos;S ROYAL GOLF INC.</strong> We focus on golf-oriented travel and a
        thoughtfully selected shop so you can plan trips and gear up in one place. Our retail lines include{' '}
        <strong className="text-foreground">golf equipment</strong> and other travel- and leisure-related items, with
        each product described on its own listing online.
      </p>

      <h2>What we do</h2>
      <ul>
        <li>
          <strong className="text-foreground">Golf activities & places</strong> — Browse dates, pricing, golf
          destination options, and hotel-ready inclusions, then book experiences that match how you like to travel. For hands-on tour assistance after booking, requests are{' '}
          <strong className="text-foreground">endorsed to a local accredited travel agency</strong> so you work with
          licensed professionals on the ground.
        </li>
        <li>
          <strong className="text-foreground">Shop</strong> — Purchase online with clear, line-by-line product
          information at checkout. Our assortment emphasizes <strong className="text-foreground">golf equipment</strong>{' '}
          and other related travel and lifestyle items.
        </li>
        <li>
          <strong className="text-foreground">Account &amp; dashboard</strong> — Signed-in customers can track orders
          and bookings in one dashboard.
        </li>
      </ul>

      <h2>Our commitment</h2>
      <p>
        We aim for transparent pricing, responsive support through the contact details in our footer, and fair
        handling of orders and refunds as described in our{' '}
        <Link href="/company-policy">company policy</Link>, <Link href="/refund-policy">refund policy</Link>, and{' '}
        <Link href="/privacy-policy">privacy policy</Link>.
      </p>

      <h2>Visit us</h2>
      <p>
        For inquiries:{' '}
        <a href="mailto:info@rogersroyalgolf.com">info@rogersroyalgolf.com</a>
      </p>
    </MarketingDocLayout>
  )
}
