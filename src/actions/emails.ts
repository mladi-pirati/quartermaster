'use server'

import { db } from '@/db'
import { emailLogs, orders } from '@/db/schema'
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '@/lib/resend'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function retryOrderEmail(
  emailLogId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const [log] = await db
    .select()
    .from(emailLogs)
    .where(eq(emailLogs.id, emailLogId))
    .limit(1)

  if (!log) return { success: false, error: 'Email log not found' }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, log.orderId))
    .limit(1)

  if (!order) return { success: false, error: 'Order not found' }

  if (log.type === 'order_confirmation') {
    await sendOrderConfirmationEmail(order.id)
  } else {
    await sendOrderStatusUpdateEmail(order, log.type)
  }

  revalidatePath(`/admin/orders/${order.id}`)
  return { success: true }
}

// DEBUG: resend confirmation email for any order directly from the orders list
export async function debugResendConfirmation(
  orderId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await sendOrderConfirmationEmail(orderId)
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}
