import { db } from '@/db'
import { pickupLocations } from '@/db/schema'
import { asc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  const locations = await db
    .select({
      id: pickupLocations.id,
      name: pickupLocations.name,
      address: pickupLocations.address,
      city: pickupLocations.city,
      country: pickupLocations.country,
    })
    .from(pickupLocations)
    .where(eq(pickupLocations.isActive, true))
    .orderBy(asc(pickupLocations.name))

  return NextResponse.json(locations)
}
