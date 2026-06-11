'use client'

import { useRef, useState } from 'react'
import {
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ordersColumns } from './orders-columns'
import type { Order } from '@/db/schema'

interface OrdersDataTableProps {
  data: Order[]
}

export function OrdersDataTable({ data }: OrdersDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns: ordersColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  })

  const rows = table.getRowModel().rows

  const parentRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 10,
  })

  const virtualItems = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()

  return (
    <div className="flex h-full flex-col gap-2">
      <div
        ref={parentRef}
        className="flex-1 min-h-0 overflow-auto rounded-md border"
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={ordersColumns.length} className="h-24 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {virtualItems[0]?.start > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={ordersColumns.length}
                      style={{ height: virtualItems[0].start, padding: 0 }}
                    />
                  </TableRow>
                )}
                {virtualItems.map((virtualRow) => {
                  const row = rows[virtualRow.index]
                  return (
                    <TableRow key={row.id} className="cursor-pointer">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })}
                {totalSize - (virtualItems[virtualItems.length - 1]?.end ?? 0) > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={ordersColumns.length}
                      style={{ height: totalSize - (virtualItems[virtualItems.length - 1]?.end ?? 0), padding: 0 }}
                    />
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        {rows.length} {rows.length === 1 ? 'order' : 'orders'}
      </p>
    </div>
  )
}
