'use client'

import { updateOrderStatus } from '@/actions/orders'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
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

const CONFIRM_NOTICE: Partial<Record<OrderStatus, string>> = {
  shipped: 'The customer will be notified by email that their order has been shipped.',
  ready_for_pickup: 'The customer will be notified by email that their order is ready for pickup.',
  cancelled: 'The order will be cancelled and the customer will be notified by email.',
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
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  async function handleChange(next: OrderStatus) {
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

  function handleValueChange(value: string | null) {
    if (!value) return
    const next = value as OrderStatus
    if (next in CONFIRM_NOTICE) {
      setPendingStatus(next)
      setDialogOpen(true)
    } else {
      handleChange(next)
    }
  }

  async function handleConfirm() {
    if (!pendingStatus) return
    setDialogOpen(false)
    await handleChange(pendingStatus)
    setPendingStatus(null)
  }

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open)
    if (!open) setPendingStatus(null)
  }

  return (
    <>
      <Select value={status} onValueChange={handleValueChange} disabled={loading}>
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

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Confirm status update</DialogTitle>
            <DialogDescription>
              {pendingStatus && CONFIRM_NOTICE[pendingStatus]}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button onClick={handleConfirm} disabled={loading}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
