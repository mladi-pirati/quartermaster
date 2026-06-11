'use client'

import { Column, ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Order } from '@/db/schema'

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled'

const statusVariant: Record<OrderStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'secondary',
  confirmed: 'default',
  shipped: 'outline',
  completed: 'default',
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
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status as OrderStatus]} className="capitalize">
        {row.original.status}
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
