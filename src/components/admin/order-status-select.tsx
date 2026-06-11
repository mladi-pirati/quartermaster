'use client'

import { updateOrderStatus } from '@/actions/orders'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { toast } from 'sonner'

const STATUSES = [
  'pending',
  'confirmed',
  'shipped',
  'completed',
  'cancelled',
] as const

type OrderStatus = (typeof STATUSES)[number]

interface OrderStatusSelectProps {
  orderId: string
  currentStatus: OrderStatus
}

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: OrderStatusSelectProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [loading, setLoading] = useState(false)

  async function handleChange(value: string | null) {
    if (!value) return
    const next = value as OrderStatus
    setLoading(true)
    const result = await updateOrderStatus(orderId, next)
    setLoading(false)

    if (result.success) {
      setStatus(next)
      toast.success('Status updated')
    } else {
      toast.error('Failed to update status')
    }
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
