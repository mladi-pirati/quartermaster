'use client'

import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'

const ALL_STATUSES = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled'] as const
type OrderStatus = (typeof ALL_STATUSES)[number]

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

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger>
        {value === 'all'
          ? `All (${counts.all})`
          : `${value.charAt(0).toUpperCase() + value.slice(1)} (${counts[value]})`}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All ({counts.all})</SelectItem>
        {ALL_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
