'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { bulkSendPredracunReminder } from '@/actions/emails'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface BulkPredracunDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderIds: string[]
  onSuccess: () => void
}

export function BulkPredracunDialog({
  open,
  onOpenChange,
  orderIds,
  onSuccess,
}: BulkPredracunDialogProps) {
  const [body, setBody] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSend() {
    if (!body.trim()) {
      toast.error('Prosimo, vnesite besedilo sporočila.')
      return
    }

    setIsLoading(true)
    try {
      const result = await bulkSendPredracunReminder(orderIds, body)
      if (result.success) {
        toast.success(`Predračun poslan ${result.sent} naročilom.`)
        setBody('')
        onOpenChange(false)
        onSuccess()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Pošiljanje ni uspelo. Poskusite znova.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Pošlji popravljen predračun</DialogTitle>
          <DialogDescription>
            Sporočilo bo poslano {orderIds.length}{' '}
            {orderIds.length === 1 ? 'naročilu' : 'naročilom'} z novo generiranim predračunom v priponki.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <Label htmlFor="bulk-body">Besedilo sporočila</Label>
          <Textarea
            id="bulk-body"
            placeholder="Spoštovani, v priponki se nahaja popravljen predračun za vaše naročilo..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Sporočilo se bo začelo z <strong>Zdravo [ime]</strong> in vsebovalo podatke za plačilo.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Prekliči
          </Button>
          <Button onClick={handleSend} disabled={isLoading || !body.trim()}>
            {isLoading ? 'Pošiljanje…' : `Pošlji (${orderIds.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
