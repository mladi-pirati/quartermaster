'use client'

import { Column, ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { Order } from '@/db/schema'
import { formatPaymentReference } from '@/lib/format'

type OrderStatus = 'pending' | 'preparing' | 'shipped' | 'ready_for_pickup' | 'complete' | 'cancelled'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  shipped: 'Shipped',
  ready_for_pickup: 'Ready for Pickup',
  complete: 'Complete',
  cancelled: 'Cancelled',
}

const statusVariant: Record<OrderStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'secondary',
  preparing: 'default',
  shipped: 'outline',
  ready_for_pickup: 'outline',
  complete: 'default',
  cancelled: 'destructive',
}

function SortableHeader({ column, label }: { column: Column<Order, unknown>; label: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {label}
      <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
    </Button>
  )
}

export const ordersColumns: ColumnDef<Order>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Izberi vse"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Izberi vrstico"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => <SortableHeader column={column} label="Order ID" />,
    cell: ({ row }) => (
      <Link
        href={`/admin/orders/${row.original.id}`}
        className="font-mono text-xs hover:underline"
      >
        {row.original.id.slice(0, 8)}…
      </Link>
    ),
  },
  {
    accessorKey: 'fullName',
    header: ({ column }) => <SortableHeader column={column} label="Customer" />,
    cell: ({ row }) => (
      <Link href={`/admin/orders/${row.original.id}`} className="hover:underline">
        <div className="font-medium">{row.original.fullName}</div>
        <div className="text-xs text-muted-foreground">{row.original.email}</div>
      </Link>
    ),
  },
  {
    accessorKey: 'invoiceNumber',
    header: ({ column }) => <SortableHeader column={column} label="Predračun / račun" />,
    cell: ({ row }) => {
      const invoiceNumber = row.original.invoiceNumber

      if (!invoiceNumber) {
        return <span className="text-muted-foreground">—</span>
      }

      return (
        <div className="flex flex-col font-mono text-xs">
          <span>{invoiceNumber}</span>
          <span className="text-muted-foreground">
            Sklic: {formatPaymentReference(invoiceNumber)}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'deliveryType',
    header: ({ column }) => <SortableHeader column={column} label="Delivery" />,
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <Badge variant="outline" className="w-fit capitalize">
          {row.original.deliveryType}
        </Badge>
        {row.original.deliveryType === 'shipping' && row.original.city && (
          <span className="text-xs text-muted-foreground">{row.original.city}</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <SortableHeader column={column} label="Status" />,
    cell: ({ row }) => {
      const status = row.original.status as OrderStatus
      return (
        <Badge variant={statusVariant[status]}>
          {STATUS_LABELS[status]}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'isPaid',
    header: 'Payment',
    cell: ({ row }) => (
      <Badge variant={row.original.isPaid ? 'default' : 'secondary'}>
        {row.original.isPaid ? 'Paid' : 'Unpaid'}
      </Badge>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <SortableHeader column={column} label="Date" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {format(new Date(row.original.createdAt), 'dd. MM. yyyy')}
      </span>
    ),
  },
]
