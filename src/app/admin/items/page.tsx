import { db } from '@/db'
import { items } from '@/db/schema'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeleteItemButton } from '@/components/admin/delete-item-button'
import { desc } from 'drizzle-orm'
import { PlusIcon, PencilIcon } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/format'

const statusVariant = {
  active: 'default',
  draft: 'secondary',
  inactive: 'outline',
} as const

export default async function ItemsPage() {
  const allItems = await db.select().from(items).orderBy(desc(items.createdAt))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Items</h1>
        <Button render={<Link href="/admin/items/new" />} nativeButton={false}>
          <PlusIcon />
          New item
        </Button>
      </div>

      {allItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No items yet. Create your first item.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Sizes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {allItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/items/${item.id}`} className="hover:underline">
                    {item.name}
                  </Link>
                </TableCell>
                <TableCell>{formatPrice(item.price)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {item.sizes.length > 0 ? item.sizes.join(', ') : '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[item.status]}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      render={<Link href={`/admin/items/${item.id}`} />}
                      nativeButton={false}
                    >
                      <PencilIcon />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <DeleteItemButton id={item.id} name={item.name} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
