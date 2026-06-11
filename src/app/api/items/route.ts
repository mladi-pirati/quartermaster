import { db } from '@/db'
import { itemImages, items } from '@/db/schema'
import { asc, desc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  const allItems = await db.select().from(items).where(eq(items.status, 'active')).orderBy(desc(items.createdAt))
  const allImages = await db.select().from(itemImages).orderBy(asc(itemImages.sortOrder))

  const imagesByItemId = new Map<string, typeof allImages>()
  for (const image of allImages) {
    const list = imagesByItemId.get(image.itemId) ?? []
    list.push(image)
    imagesByItemId.set(image.itemId, list)
  }

  const appUrl = process.env.APP_URL ?? ''

  const result = allItems.map((item) => ({
    ...item,
    price: (item.price / 100).toFixed(2),
    images: (imagesByItemId.get(item.id) ?? []).map((img) => ({
      id: img.id,
      url: `${appUrl}/api/images/${img.s3Key}`,
      sortOrder: img.sortOrder,
    })),
  }))

  return NextResponse.json(result)
}
