'use server'

import { db } from '@/db'
import { orders } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const statusSchema = z.enum([
  'pending',
  'preparing',
  'shipped',
  'ready_for_pickup',
  'complete',
  'cancelled',
])

export async function updateOrderStatus(
  orderId: string,
  status: z.infer<typeof statusSchema>,
) {
  const parsed = statusSchema.safeParse(status)
  if (!parsed.success) {
    return { success: false as const, error: 'Invalid status' }
  }

  const [order] = await db
    .update(orders)
    .set({ status: parsed.data })
    .where(eq(orders.id, orderId))
    .returning()

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  return { success: true as const, data: order }
}

export async function updateOrderPaymentStatus(orderId: string, isPaid: boolean) {
  const [order] = await db
    .update(orders)
    .set({ isPaid })
    .where(eq(orders.id, orderId))
    .returning()

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  return { success: true as const, data: order }
}
