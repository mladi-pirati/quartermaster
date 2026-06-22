import { db } from '@/db'
import { invoiceCounters, orderItems, orders, shippingOptions } from '@/db/schema'
import { generateUpnQrDataUrl } from '@/lib/upn-qr'
import { addDays } from 'date-fns'
import { eq, sql } from 'drizzle-orm'
import { readFileSync } from 'fs'
import { join } from 'path'
import React from 'react'
import type { DocumentProps } from '@react-pdf/renderer'

function localNoonUtc(date: Date): Date {
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Ljubljana' }).format(date)
  return new Date(ymd + 'T12:00:00Z')
}

export async function generatePredracunBuffer(orderId: string): Promise<Buffer> {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
  if (!order) throw new Error(`Order not found: ${orderId}`)

  let { invoiceNumber, invoiceIssuedAt: issueDate, invoiceDueAt: dueDate } = order
  if (!invoiceNumber || !issueDate || !dueDate) {
    const result = await db.transaction(async (tx) => {
      let number = invoiceNumber
      if (!number) {
        const year = order.createdAt.getFullYear()
        const [counter] = await tx
          .insert(invoiceCounters)
          .values({ year, lastNumber: 1 })
          .onConflictDoUpdate({
            target: invoiceCounters.year,
            set: { lastNumber: sql`${invoiceCounters.lastNumber} + 1` },
          })
          .returning({ lastNumber: invoiceCounters.lastNumber })
        number = `${String(counter.lastNumber).padStart(3, '0')}-${year}`
      }
      const issued = issueDate ?? localNoonUtc(order.createdAt)
      const due = dueDate ?? addDays(issued, 8)
      await tx
        .update(orders)
        .set({ invoiceNumber: number, invoiceIssuedAt: issued, invoiceDueAt: due })
        .where(eq(orders.id, orderId))
      return { invoiceNumber: number, issueDate: issued, dueDate: due }
    })
    invoiceNumber = result.invoiceNumber
    issueDate = result.issueDate
    dueDate = result.dueDate
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

  const itemsTotal = lineItems.reduce((sum, l) => sum + l.itemPriceSnapshot * l.quantity, 0)
  const shippingTotal = shippingOption?.price ?? 0
  const grandTotal = itemsTotal + shippingTotal

  const payerStreet =
    order.deliveryType === 'shipping' && order.address ? order.address : ''
  const payerCity =
    order.deliveryType === 'shipping' && order.postalCode && order.city
      ? `${order.postalCode} ${order.city}`
      : ''

  const qrDataUrl = await generateUpnQrDataUrl({
    payerName: order.fullName,
    payerStreet,
    payerCity,
    amountEurocents: grandTotal,
    invoiceNumber,
    dueDate,
  })

  const logoBuffer = readFileSync(join(process.cwd(), 'public', 'mladi-pirati-logo.png'))
  const logoDataUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`

  const { renderToBuffer } = await import('@react-pdf/renderer')
  const { PredracunDocument } = await import('@/components/pdf/predracun-document')

  return await renderToBuffer(
    React.createElement(PredracunDocument, {
      invoiceNumber,
      issueDate,
      dueDate,
      order,
      lineItems,
      shippingOption,
      qrDataUrl,
      logoDataUrl,
    }) as React.ReactElement<DocumentProps>,
  )
}
