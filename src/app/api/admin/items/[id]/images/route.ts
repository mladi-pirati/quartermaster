import { db } from '@/db'
import { itemImages } from '@/db/schema'
import { requireUser } from '@/lib/auth/session'
import { getPublicUrl, uploadToS3 } from '@/lib/s3'
import { eq, max } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireUser()

  const { id: itemId } = await params

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are supported' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const s3Key = `items/${itemId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())
  await uploadToS3(s3Key, buffer, file.type)

  const [maxOrderRow] = await db
    .select({ maxOrder: max(itemImages.sortOrder) })
    .from(itemImages)
    .where(eq(itemImages.itemId, itemId))

  const nextOrder = (maxOrderRow?.maxOrder ?? -1) + 1

  const [image] = await db
    .insert(itemImages)
    .values({
      itemId,
      s3Key,
      url: getPublicUrl(s3Key),
      sortOrder: nextOrder,
    })
    .returning()

  return NextResponse.json(image, { status: 201 })
}
