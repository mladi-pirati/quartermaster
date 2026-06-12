import { db } from '@/db'
import { orders } from '@/db/schema'
import { requireUser } from '@/lib/auth/session'
import { generatePredracunBuffer } from '@/lib/generate-predracun'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireUser()

  const { id } = await params

  const [order] = await db
    .select({ id: orders.id, invoiceNumber: orders.invoiceNumber })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1)

  if (!order) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const pdfBuffer = await generatePredracunBuffer(id)

  const invoiceNumber = order.invoiceNumber ?? id

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="predracun-${invoiceNumber}.pdf"`,
    },
  })
}
