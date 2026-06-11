'use client'

import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'

import { ALL_STATUSES, STATUS_LABELS, type OrderStatus } from '@/lib/order-status'
export { ALL_STATUSES, type OrderStatus }

type StatusCounts = Record<OrderStatus | 'all', number>

export function OrdersStatusFilter({
  value,
  counts,
}: {
  value: OrderStatus | 'all'
  counts: StatusCounts
}) {
  const router = useRouter()

  function handleChange(next: string | null) {
    if (!next || next === 'all') {
      router.push('/admin/orders')
    } else {
      router.push(`/admin/orders?status=${next}`)
    }
  }

  const triggerLabel =
    value === 'all'
      ? `All (${counts.all})`
      : `${STATUS_LABELS[value]} (${counts[value]})`

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger>{triggerLabel}</SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All ({counts.all})</SelectItem>
        {ALL_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {STATUS_LABELS[s]} ({counts[s]})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
