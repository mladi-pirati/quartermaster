import { db } from '@/db'
import { orders } from '@/db/schema'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { desc } from 'drizzle-orm'
import Link from 'next/link'


const ALL_STATUSES = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled'] as const
type OrderStatus = (typeof ALL_STATUSES)[number]

const statusVariant: Record<OrderStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'secondary',
  confirmed: 'default',
  shipped: 'outline',
  completed: 'default',
  cancelled: 'destructive',
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const activeTab = ALL_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : 'all'

  const allOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))

  const filtered = activeTab === 'all'
    ? allOrders
    : allOrders.filter((o) => o.status === activeTab)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Orders</h1>

      <Tabs defaultValue={activeTab}>
        <TabsList variant="line">
          <TabsTrigger value="all" render={<Link href="/admin/orders" />} nativeButton={false}>
            All ({allOrders.length})
          </TabsTrigger>
          {ALL_STATUSES.map((s) => (
            <TabsTrigger
              key={s}
              value={s}
              render={<Link href={`/admin/orders?status=${s}`} />} nativeButton={false}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} (
              {allOrders.filter((o) => o.status === s).length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer">
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-xs hover:underline"
                      >
                        {order.id.slice(0, 8)}…
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                        {order.fullName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.deliveryType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[order.status]}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(order.createdAt).toLocaleDateString('sl-SI')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
