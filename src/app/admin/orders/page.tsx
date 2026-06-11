import { db } from '@/db'
import { orders } from '@/db/schema'
import { OrdersStatusFilter } from '@/components/admin/orders-status-filter'
import { OrdersDataTable } from '@/components/admin/orders-data-table'
import { desc } from 'drizzle-orm'

const ALL_STATUSES = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled'] as const
type OrderStatus = (typeof ALL_STATUSES)[number]

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const activeStatus = ALL_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : 'all'

  const allOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))

  const filtered = activeStatus === 'all'
    ? allOrders
    : allOrders.filter((o) => o.status === activeStatus)

  const counts = {
    all: allOrders.length,
    ...Object.fromEntries(ALL_STATUSES.map((s) => [s, allOrders.filter((o) => o.status === s).length])),
  } as Record<OrderStatus | 'all', number>

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex shrink-0 items-center justify-between">
        <h1 className="text-xl font-semibold">Orders</h1>
        <OrdersStatusFilter value={activeStatus} counts={counts} />
      </div>
      <OrdersDataTable data={filtered} />
    </div>
  )
}
