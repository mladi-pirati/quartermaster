'use server'

import { db } from '@/db'
import { pickupLocations } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const locationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
})

type LocationInput = z.infer<typeof locationSchema>

export async function createPickupLocation(data: LocationInput) {
  const parsed = locationSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message }
  }

  const [location] = await db
    .insert(pickupLocations)
    .values(parsed.data)
    .returning()
  revalidatePath('/admin/pickup-locations')
  return { success: true as const, data: location }
}

export async function updatePickupLocation(id: string, data: LocationInput) {
  const parsed = locationSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message }
  }

  const [location] = await db
    .update(pickupLocations)
    .set(parsed.data)
    .where(eq(pickupLocations.id, id))
    .returning()

  revalidatePath('/admin/pickup-locations')
  return { success: true as const, data: location }
}

export async function togglePickupLocation(id: string) {
  const [existing] = await db
    .select()
    .from(pickupLocations)
    .where(eq(pickupLocations.id, id))
    .limit(1)

  if (!existing) return { success: false as const, error: 'Not found' }

  const [location] = await db
    .update(pickupLocations)
    .set({ isActive: !existing.isActive })
    .where(eq(pickupLocations.id, id))
    .returning()

  revalidatePath('/admin/pickup-locations')
  return { success: true as const, data: location }
}

export async function deletePickupLocation(id: string) {
  await db.delete(pickupLocations).where(eq(pickupLocations.id, id))
  revalidatePath('/admin/pickup-locations')
  return { success: true as const }
}
