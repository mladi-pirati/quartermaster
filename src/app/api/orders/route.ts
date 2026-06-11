import { db } from '@/db'
import { invoiceCounters, items, orderItems, orders } from '@/db/schema'
import { checkRateLimit } from '@/lib/rate-limit'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { addDays } from 'date-fns'
import { and, eq, inArray, sql } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const orderSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    deliveryType: z.enum(['shipping', 'pickup']),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    pickupLocationId: z.preprocess((v) => v === '' ? undefined : v, z.string().uuid().optional()),
    shippingOptionId: z.preprocess((v) => v === '' ? undefined : v, z.string().uuid().optional()),
    notes: z.string().max(500).optional(),
    captchaToken: z.string().optional(),
    items: z
      .array(
        z.object({
          itemId: z.string().uuid(),
          size: z.string().min(1),
          quantity: z.number().int().min(1),
        }),
      )
      .min(1, 'At least one item is required'),
  })
  .refine(
    (data) =>
      data.deliveryType !== 'shipping' ||
      (data.address && data.city && data.postalCode && data.country),
    {
      message: 'Shipping requires address, city, postal code, and country',
      path: ['address'],
    },
  )
  .refine(
    (data) =>
      data.deliveryType !== 'shipping' || Boolean(data.shippingOptionId),
    {
      message: 'Shipping requires a shipping option',
      path: ['shippingOptionId'],
    },
  )
  .refine(
    (data) =>
      data.deliveryType !== 'pickup' || Boolean(data.pickupLocationId),
    {
      message: 'Pickup requires a pickup location',
      path: ['pickupLocationId'],
    },
  )

// Returns noon UTC on the calendar date corresponding to `date` in Ljubljana.
// Storing noon UTC keeps the displayed date unambiguous in any timezone.
function localNoonUtc(date: Date): Date {
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Ljubljana' }).format(date)
  return new Date(ymd + 'T12:00:00Z')
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = orderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    )
  }

  const data = parsed.data
  const ip = getClientIp(request)

  if (!data.captchaToken) {
    const rateLimit = await checkRateLimit('orders', ip, 10, 10 * 60 * 1000)
    if (rateLimit.limited) {
      return NextResponse.json(
        { code: 'captcha_required' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter),
            'Cache-Control': 'no-store',
          },
        },
      )
    }
  } else {
    const captchaResult = await verifyTurnstileToken(data.captchaToken, {
      remoteIp: ip,
    })
    if (!captchaResult.ok) {
      return NextResponse.json({ code: 'captcha_invalid' }, { status: 400 })
    }
  }

  const itemIds = [...new Set(data.items.map((i) => i.itemId))]
  const activeItems = await db
    .select()
    .from(items)
    .where(and(inArray(items.id, itemIds), eq(items.status, 'active')))

  if (activeItems.length !== itemIds.length) {
    return NextResponse.json(
      { error: 'One or more items are unavailable' },
      { status: 400 },
    )
  }

  for (const orderItem of data.items) {
    const item = activeItems.find((i) => i.id === orderItem.itemId)!
    if (!item.sizes.includes(orderItem.size)) {
      return NextResponse.json(
        { error: `Invalid size "${orderItem.size}" for item "${item.name}"` },
        { status: 400 },
      )
    }
  }

  const result = await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        deliveryType: data.deliveryType,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        pickupLocationId: data.pickupLocationId,
        shippingOptionId: data.shippingOptionId,
        notes: data.notes,
      })
      .returning()

    await tx.insert(orderItems).values(
      data.items.map((orderItem) => {
        const item = activeItems.find((i) => i.id === orderItem.itemId)!
        return {
          orderId: order.id,
          itemId: orderItem.itemId,
          itemNameSnapshot: item.name,
          itemPriceSnapshot: item.price,
          size: orderItem.size,
          quantity: orderItem.quantity,
        }
      }),
    )

    // Assign invoice number and dates immediately at order creation.
    // Snap to noon UTC of the Ljubljana calendar date so the stored timestamp
    // is unambiguously the correct local date regardless of server timezone.
    const invoiceIssuedAt = localNoonUtc(new Date())
    const invoiceDueAt = addDays(invoiceIssuedAt, 8)
    const year = invoiceIssuedAt.getUTCFullYear()
    const [counter] = await tx
      .insert(invoiceCounters)
      .values({ year, lastNumber: 1 })
      .onConflictDoUpdate({
        target: invoiceCounters.year,
        set: { lastNumber: sql`${invoiceCounters.lastNumber} + 1` },
      })
      .returning({ lastNumber: invoiceCounters.lastNumber })

    const invoiceNumber = `QM-${String(counter.lastNumber).padStart(3, '0')}-${year}`

    await tx
      .update(orders)
      .set({ invoiceNumber, invoiceIssuedAt, invoiceDueAt })
      .where(eq(orders.id, order.id))

    return order
  })

  return NextResponse.json({ orderId: result.id }, { status: 201 })
}
