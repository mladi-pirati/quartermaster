'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { debugResendConfirmation } from '@/actions/emails'
import { Button } from '@/components/ui/button'
import { SendIcon } from 'lucide-react'

export function ResendEmailButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    const result = await debugResendConfirmation(orderId)
    setLoading(false)
    if (result.success) {
      toast.success('Email sent')
    } else {
      toast.error(`Failed: ${result.error}`)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      disabled={loading}
      onClick={handleClick}
      title="[DEBUG] Resend confirmation email"
    >
      <SendIcon className={loading ? 'animate-pulse' : ''} />
    </Button>
  )
}
