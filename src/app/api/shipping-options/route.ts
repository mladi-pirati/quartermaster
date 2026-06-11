import { db } from '@/db'
import { shippingOptions } from '@/db/schema'
import { asc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  const options = await db
    .select({
      id: shippingOptions.id,
      name: shippingOptions.name,
      estimatedDeliveryTime: shippingOptions.estimatedDeliveryTime,
      price: shippingOptions.price,
    })
    .from(shippingOptions)
    .where(eq(shippingOptions.isActive, true))
    .orderBy(asc(shippingOptions.name))

  return NextResponse.json(
    options.map((o) => ({ ...o, price: Number((o.price / 100).toFixed(2)) })),
  )
}
