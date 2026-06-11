'use server'

import { db } from '@/db'
import { itemImages, items } from '@/db/schema'
import { deleteS3Object } from '@/lib/s3'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const itemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().int().min(0, 'Price must be a positive number'),
  sizes: z.array(z.string().min(1)).default([]),
  status: z.enum(['draft', 'active', 'inactive']),
})

type ItemInput = z.infer<typeof itemSchema>

export async function createItem(data: ItemInput) {
  const parsed = itemSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message }
  }

  const [item] = await db.insert(items).values(parsed.data).returning()
  revalidatePath('/admin/items')
  return { success: true as const, data: item }
}

export async function updateItem(id: string, data: ItemInput) {
  const parsed = itemSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message }
  }

  const [item] = await db
    .update(items)
    .set(parsed.data)
    .where(eq(items.id, id))
    .returning()

  revalidatePath('/admin/items')
  revalidatePath(`/admin/items/${id}`)
  return { success: true as const, data: item }
}

export async function deleteItem(id: string) {
  const images = await db
    .select()
    .from(itemImages)
    .where(eq(itemImages.itemId, id))

  await Promise.all(images.map((img) => deleteS3Object(img.s3Key)))

  await db.delete(items).where(eq(items.id, id))
  revalidatePath('/admin/items')
  return { success: true as const }
}

export async function reorderImages(itemId: string, orderedIds: string[]) {
  await Promise.all(
    orderedIds.map((imageId, index) =>
      db
        .update(itemImages)
        .set({ sortOrder: index })
        .where(eq(itemImages.id, imageId)),
    ),
  )
  revalidatePath(`/admin/items/${itemId}`)
  return { success: true as const }
}

export async function deleteImage(imageId: string) {
  const [image] = await db
    .select()
    .from(itemImages)
    .where(eq(itemImages.id, imageId))
    .limit(1)

  if (!image) return { success: false as const, error: 'Image not found' }

  await deleteS3Object(image.s3Key)
  await db.delete(itemImages).where(eq(itemImages.id, imageId))
  revalidatePath(`/admin/items/${image.itemId}`)
  return { success: true as const }
}
