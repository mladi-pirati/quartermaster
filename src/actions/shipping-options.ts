'use server'

import { db } from '@/db'
import { shippingOptions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const shippingOptionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().int().min(0, 'Price must be non-negative'),
})

type ShippingOptionInput = z.infer<typeof shippingOptionSchema>

export async function createShippingOption(data: ShippingOptionInput) {
  const parsed = shippingOptionSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message }
  }

  const [option] = await db
    .insert(shippingOptions)
    .values(parsed.data)
    .returning()
  revalidatePath('/admin/shipping-options')
  return { success: true as const, data: option }
}

export async function updateShippingOption(id: string, data: ShippingOptionInput) {
  const parsed = shippingOptionSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message }
  }

  const [option] = await db
    .update(shippingOptions)
    .set(parsed.data)
    .where(eq(shippingOptions.id, id))
    .returning()

  revalidatePath('/admin/shipping-options')
  return { success: true as const, data: option }
}

export async function toggleShippingOption(id: string) {
  const [existing] = await db
    .select()
    .from(shippingOptions)
    .where(eq(shippingOptions.id, id))
    .limit(1)

  if (!existing) return { success: false as const, error: 'Not found' }

  const [option] = await db
    .update(shippingOptions)
    .set({ isActive: !existing.isActive })
    .where(eq(shippingOptions.id, id))
    .returning()

  revalidatePath('/admin/shipping-options')
  return { success: true as const, data: option }
}

export async function deleteShippingOption(id: string) {
  await db.delete(shippingOptions).where(eq(shippingOptions.id, id))
  revalidatePath('/admin/shipping-options')
  return { success: true as const }
}
