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

type DeliveryType = 'shipping' | 'pickup'
type OrderStatus = 'pending' | 'preparing' | 'shipped' | 'ready_for_pickup' | 'complete' | 'cancelled'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  shipped: 'Shipped',
  ready_for_pickup: 'Ready for Pickup',
  complete: 'Complete',
  cancelled: 'Cancelled',
}

function getStatuses(deliveryType: DeliveryType): OrderStatus[] {
  return [
    'pending',
    'preparing',
    deliveryType === 'shipping' ? 'shipped' : 'ready_for_pickup',
    'complete',
    'cancelled',
  ]
}

interface OrderStatusSelectProps {
  orderId: string
  currentStatus: OrderStatus
  deliveryType: DeliveryType
}

export function OrderStatusSelect({
  orderId,
  currentStatus,
  deliveryType,
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
      <SelectTrigger className="w-48">
        <SelectValue>{STATUS_LABELS[status]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {getStatuses(deliveryType).map((s) => (
          <SelectItem key={s} value={s}>
            {STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
