import { db } from '@/db'
import { shippingOptions } from '@/db/schema'
import { ShippingOptionManager } from '@/components/admin/shipping-option-manager'
import { desc } from 'drizzle-orm'

export default async function ShippingOptionsPage() {
  const options = await db
    .select()
    .from(shippingOptions)
    .orderBy(desc(shippingOptions.createdAt))

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Shipping Options</h1>
      <ShippingOptionManager initialOptions={options} />
    </div>
  )
}
