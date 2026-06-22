'use client'

import { useRef, useState } from 'react'
import {
  RowSelectionState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
import { Button } from '@/components/ui/button'
import { ordersColumns } from './orders-columns'
import { BulkPredracunDialog } from './bulk-predracun-dialog'
import type { Order } from '@/db/schema'

interface OrdersDataTableProps {
  data: Order[]
}

export function OrdersDataTable({ data }: OrdersDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [dialogOpen, setDialogOpen] = useState(false)

  const table = useReactTable({
    data,
    columns: ordersColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    state: { sorting, rowSelection },
  })

  const rows = table.getRowModel().rows
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedOrderIds = selectedRows.map((r) => r.original.id)

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
      {selectedOrderIds.length > 0 && (
        <div className="flex shrink-0 items-center gap-3 rounded-md border bg-muted/40 px-4 py-2">
          <span className="text-sm text-muted-foreground">
            {selectedOrderIds.length}{' '}
            {selectedOrderIds.length === 1 ? 'naročilo izbrano' : 'naročil izbranih'}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDialogOpen(true)}
          >
            Pošlji popravljen predračun
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => table.resetRowSelection()}
          >
            Prekliči izbor
          </Button>
        </div>
      )}

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
                    <TableRow
                      key={row.id}
                      className="cursor-pointer"
                      data-state={row.getIsSelected() ? 'selected' : undefined}
                    >
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

      <BulkPredracunDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        orderIds={selectedOrderIds}
        onSuccess={() => table.resetRowSelection()}
      />
    </div>
  )
}
