import nodemailer from 'nodemailer'
import { formatPeso } from '@/lib/currency/format'

function cleanEnv(value?: string) {
  return value?.trim().replace(/^['"]|['"]$/g, '') ?? ''
}

function getSmtpConfig() {
  const host = cleanEnv(process.env.SMTP_HOST)
  const user = cleanEnv(process.env.SMTP_USER)
  const pass = cleanEnv(process.env.SMTP_PASS)
  if (!host || !user || !pass) return null

  const port = Number(cleanEnv(process.env.SMTP_PORT) || '587')
  const secure =
    cleanEnv(process.env.SMTP_SECURE).toLowerCase() === 'true' || port === 465

  return {
    host,
    port,
    secure,
    auth: { user, pass },
  }
}

export type OrderConfirmationEmailPayload = {
  to: string
  customerName: string
  orderNumber: string
  referenceNumber?: string | null
  totalAmount: number
  items: Array<{ name: string; quantity: number; price: number }>
  appUrl?: string
}

export async function sendOrderConfirmationEmail(
  payload: OrderConfirmationEmailPayload
): Promise<{ sent: boolean; reason?: string }> {
  const smtp = getSmtpConfig()
  if (!smtp) {
    return { sent: false, reason: 'SMTP not configured' }
  }

  const from =
    cleanEnv(process.env.SMTP_FROM) || cleanEnv(process.env.SMTP_USER) || 'orders@rogersroyalgolf.com'
  const appUrl = (payload.appUrl || cleanEnv(process.env.APP_URL) || cleanEnv(process.env.NEXT_PUBLIC_APP_URL) || '').replace(/\/+$/, '')
  const lines = payload.items
    .map(
      (item) =>
        `• ${item.name} × ${item.quantity} — ₱${formatPeso(item.price * item.quantity)}`
    )
    .join('\n')

  const referenceLine = payload.referenceNumber
    ? `\nPayment reference: ${payload.referenceNumber}`
    : ''

  const text = `Hi ${payload.customerName},

Thank you for your order with Roger's Royal Golf.

Please save these details for your records:

Order number: ${payload.orderNumber}${referenceLine}

Items:
${lines}

Total: ₱${formatPeso(payload.totalAmount)}

Keep your order number handy — you'll need it if you contact us about delivery or order status.
${appUrl ? `\nVisit ${appUrl} to continue shopping.` : ''}

— Roger's Royal Golf`

  const html = `
    <p>Hi ${payload.customerName},</p>
    <p>Thank you for your order with <strong>Roger's Royal Golf</strong>.</p>
    <p><strong>Please save these details:</strong></p>
    <ul>
      <li><strong>Order number:</strong> ${payload.orderNumber}</li>
      ${payload.referenceNumber ? `<li><strong>Payment reference:</strong> ${payload.referenceNumber}</li>` : ''}
    </ul>
    <p><strong>Items</strong></p>
    <ul>
      ${payload.items
        .map(
          (item) =>
            `<li>${item.name} × ${item.quantity} — ₱${formatPeso(item.price * item.quantity)}</li>`
        )
        .join('')}
    </ul>
    <p><strong>Total:</strong> ₱${formatPeso(payload.totalAmount)}</p>
    <p>Keep your order number handy — you'll need it if you contact us about delivery or order status.</p>
    ${appUrl ? `<p><a href="${appUrl}">Continue shopping</a></p>` : ''}
    <p>— Roger's Royal Golf</p>
  `

  try {
    const transport = nodemailer.createTransport(smtp)
    await transport.sendMail({
      from,
      to: payload.to,
      subject: `Order confirmed — ${payload.orderNumber}`,
      text,
      html,
    })
    return { sent: true }
  } catch (error) {
    console.error('[sendOrderConfirmationEmail]', error)
    return {
      sent: false,
      reason: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}
