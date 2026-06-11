import { db } from '@/db'
import { orderItems, orders, pickupLocations } from '@/db/schema'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { OrderStatusSelect } from '@/components/admin/order-status-select'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { formatPrice } from '@/lib/format'
import Link from 'next/link'
import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1)
  if (!order) notFound()

  const lineItems = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id))

  let pickupLocation = null
  if (order.pickupLocationId) {
    const [loc] = await db
      .select()
      .from(pickupLocations)
      .where(eq(pickupLocations.id, order.pickupLocationId))
      .limit(1)
    pickupLocation = loc ?? null
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" render={<Link href="/admin/orders" />} nativeButton={false}>
          <ArrowLeftIcon />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-xl font-semibold">Order {order.id.slice(0, 8)}…</h1>
        <Badge variant="secondary" className="ml-auto">
          {new Date(order.createdAt).toLocaleDateString('sl-SI')}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Customer info */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Customer</h2>
          <div className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{order.fullName}</span>
            <span>{order.email}</span>
            {order.phone && <span>{order.phone}</span>}
          </div>
        </div>

        {/* Delivery info */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Delivery</h2>
          <div className="flex flex-col gap-1 text-sm">
            <Badge variant="outline" className="w-fit">
              {order.deliveryType}
            </Badge>
            {order.deliveryType === 'shipping' && (
              <div className="mt-1 flex flex-col gap-0.5 text-muted-foreground">
                <span>{order.address}</span>
                <span>
                  {order.postalCode} {order.city}
                </span>
                <span>{order.country}</span>
              </div>
            )}
            {order.deliveryType === 'pickup' && pickupLocation && (
              <div className="mt-1 flex flex-col gap-0.5 text-muted-foreground">
                <span className="font-medium text-foreground">
                  {pickupLocation.name}
                </span>
                <span>{pickupLocation.address}</span>
                <span>{pickupLocation.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Status</h2>
          <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">Notes</h2>
            <p className="text-sm">{order.notes}</p>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Items</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((line) => (
              <TableRow key={line.id}>
                <TableCell className="font-medium">
                  {line.itemNameSnapshot}
                </TableCell>
                <TableCell>{line.size}</TableCell>
                <TableCell>{line.quantity}</TableCell>
                <TableCell className="text-right">
                  {formatPrice(line.itemPriceSnapshot)}
                </TableCell>
                <TableCell className="text-right">
                  {formatPrice(line.itemPriceSnapshot * line.quantity)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
