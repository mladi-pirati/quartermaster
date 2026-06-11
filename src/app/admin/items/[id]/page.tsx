import { db } from '@/db'
import { itemImages, items } from '@/db/schema'
import { ItemForm } from '@/components/admin/item-form'
import { asc, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [item] = await db.select().from(items).where(eq(items.id, id)).limit(1)
  if (!item) notFound()

  const images = await db
    .select()
    .from(itemImages)
    .where(eq(itemImages.itemId, id))
    .orderBy(asc(itemImages.sortOrder))

  return <ItemForm item={item} images={images} />
}
