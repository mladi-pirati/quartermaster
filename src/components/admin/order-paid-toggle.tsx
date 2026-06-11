'use client'

import { updateOrderPaymentStatus } from '@/actions/orders'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { toast } from 'sonner'

interface OrderPaidToggleProps {
  orderId: string
  isPaid: boolean
}

export function OrderPaidToggle({ orderId, isPaid: initialIsPaid }: OrderPaidToggleProps) {
  const [isPaid, setIsPaid] = useState(initialIsPaid)
  const [loading, setLoading] = useState(false)

  async function handleChange(checked: boolean) {
    setLoading(true)
    const result = await updateOrderPaymentStatus(orderId, checked)
    setLoading(false)

    if (result.success) {
      setIsPaid(checked)
      toast.success(checked ? 'Marked as paid' : 'Marked as unpaid')
    } else {
      toast.error('Failed to update payment status')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        id="paid-toggle"
        checked={isPaid}
        onCheckedChange={handleChange}
        disabled={loading}
      />
      <Label htmlFor="paid-toggle" className="cursor-pointer">
        {isPaid ? 'Paid' : 'Unpaid'}
      </Label>
    </div>
  )
}
