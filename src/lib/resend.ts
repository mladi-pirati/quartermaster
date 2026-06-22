import { Resend } from 'resend'
import { db } from '@/db'
import { emailLogs, orderItems, orders, pickupLocations, shippingOptions } from '@/db/schema'
import type { Order, PickupLocation, ShippingOption } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { generatePredracunBuffer } from '@/lib/generate-predracun'
import { OrderConfirmationEmail } from '@/components/emails/order-confirmation'
import { OrderStatusUpdateEmail } from '@/components/emails/order-status-update'
import { PredracunReminderEmail } from '@/components/emails/predracun-reminder'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL!

async function logEmail(entry: typeof emailLogs.$inferInsert) {
  await db.insert(emailLogs).values(entry)
}

export async function sendOrderConfirmationEmail(orderId: string): Promise<void> {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
  if (!order?.invoiceNumber || !order.invoiceIssuedAt || !order.invoiceDueAt) {
    console.error('[email] sendOrderConfirmationEmail: order missing invoice data', orderId)
    return
  }

  const lineItems = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))

  let shippingOption = null
  if (order.shippingOptionId) {
    const [opt] = await db
      .select()
      .from(shippingOptions)
      .where(eq(shippingOptions.id, order.shippingOptionId))
      .limit(1)
    shippingOption = opt ?? null
  }

  const pdfBuffer = await generatePredracunBuffer(orderId)
  const subject = `Potrditev naročila ${order.invoiceNumber}`

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: [order.email],
    subject,
    react: OrderConfirmationEmail({
      order,
      lineItems,
      shippingOption,
      invoiceNumber: order.invoiceNumber,
      issueDate: order.invoiceIssuedAt,
      dueDate: order.invoiceDueAt,
    }),
    attachments: [
      {
        filename: `predracun-${order.invoiceNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  })

  await logEmail({
    orderId,
    type: 'order_confirmation',
    status: error ? 'failed' : 'sent',
    subject,
    resendId: data?.id ?? null,
    error: error ? JSON.stringify(error) : null,
  }).catch((err) => console.error('[email] failed to write email log:', err))

  if (error) {
    console.error('[email] sendOrderConfirmationEmail error:', error)
  }
}

export async function sendOrderStatusUpdateEmail(
  order: Order,
  type: 'order_shipped' | 'order_ready_for_pickup' | 'order_cancelled',
): Promise<void> {
  let shippingOption: ShippingOption | null = null
  let pickupLocation: PickupLocation | null = null

  if (type === 'order_shipped' && order.shippingOptionId) {
    const [opt] = await db
      .select()
      .from(shippingOptions)
      .where(eq(shippingOptions.id, order.shippingOptionId))
      .limit(1)
    shippingOption = opt ?? null
  }

  if (type === 'order_ready_for_pickup' && order.pickupLocationId) {
    const [loc] = await db
      .select()
      .from(pickupLocations)
      .where(eq(pickupLocations.id, order.pickupLocationId))
      .limit(1)
    pickupLocation = loc ?? null
  }

  const subject =
    type === 'order_shipped'
      ? 'Vaše naročilo je na poti'
      : type === 'order_ready_for_pickup'
        ? 'Vaše naročilo je pripravljeno za prevzem'
        : 'Vaše naročilo je preklicano'

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: [order.email],
    subject,
    react: OrderStatusUpdateEmail({ order, type, shippingOption, pickupLocation }),
  })

  await logEmail({
    orderId: order.id,
    type,
    status: error ? 'failed' : 'sent',
    subject,
    resendId: data?.id ?? null,
    error: error ? JSON.stringify(error) : null,
  }).catch((err) => console.error('[email] failed to write email log:', err))

  if (error) {
    console.error('[email] sendOrderStatusUpdateEmail error:', error)
  }
}

export async function sendPredracunReminderEmail(orderId: string, customBody: string): Promise<void> {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
  if (!order) {
    console.error('[email] sendPredracunReminderEmail: order not found', orderId)
    return
  }

  const lineItems = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId))

  let shippingOption = null
  if (order.shippingOptionId) {
    const [opt] = await db
      .select()
      .from(shippingOptions)
      .where(eq(shippingOptions.id, order.shippingOptionId))
      .limit(1)
    shippingOption = opt ?? null
  }

  const pdfBuffer = await generatePredracunBuffer(orderId)

  if (!order.invoiceNumber || !order.invoiceIssuedAt || !order.invoiceDueAt) {
    console.error('[email] sendPredracunReminderEmail: order missing invoice data', orderId)
    return
  }

  const subject = `Mladi Pirati - Popravljen predračun za naročilo ${order.id.slice(0, 8)}`

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: [order.email],
    subject,
    react: PredracunReminderEmail({
      order,
      lineItems,
      shippingOption,
      invoiceNumber: order.invoiceNumber,
      issueDate: order.invoiceIssuedAt,
      dueDate: order.invoiceDueAt,
      customBody,
    }),
    attachments: [
      {
        filename: `predracun-${order.invoiceNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  })

  await logEmail({
    orderId,
    type: 'predracun_reminder',
    status: error ? 'failed' : 'sent',
    subject,
    resendId: data?.id ?? null,
    error: error ? JSON.stringify(error) : null,
  }).catch((err) => console.error('[email] failed to write email log:', err))

  if (error) {
    console.error('[email] sendPredracunReminderEmail error:', error)
  }
}
