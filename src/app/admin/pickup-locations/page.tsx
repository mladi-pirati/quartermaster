import { db } from '@/db'
import { pickupLocations } from '@/db/schema'
import { PickupLocationManager } from '@/components/admin/pickup-location-manager'
import { desc } from 'drizzle-orm'

export default async function PickupLocationsPage() {
  const locations = await db
    .select()
    .from(pickupLocations)
    .orderBy(desc(pickupLocations.createdAt))

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Pickup Locations</h1>
      <PickupLocationManager initialLocations={locations} />
    </div>
  )
}
