'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { retryOrderEmail } from '@/actions/emails'
import type { EmailLog } from '@/db/schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCwIcon } from 'lucide-react'
import { format } from 'date-fns'

const TYPE_LABELS: Record<EmailLog['type'], string> = {
  order_confirmation: 'Potrditev naročila',
  order_shipped: 'Obvestilo o odpremi',
  order_ready_for_pickup: 'Obvestilo o prevzemu',
}

interface Props {
  logs: EmailLog[]
}

export function OrderEmailLogs({ logs }: Props) {
  const [retrying, setRetrying] = useState<string | null>(null)

  async function handleRetry(logId: string) {
    setRetrying(logId)
    const result = await retryOrderEmail(logId)
    setRetrying(null)
    if (result.success) {
      toast.success('E-pošta je bila uspešno poslana')
    } else {
      toast.error(`Pošiljanje ni uspelo: ${result.error}`)
    }
  }

  if (logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Ni poslanih e-poštnih sporočil.</p>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {logs.map((log) => (
        <div key={log.id} className="flex items-start justify-between gap-4 py-3">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-sm font-medium">{TYPE_LABELS[log.type]}</span>
            <span className="text-xs text-muted-foreground truncate">{log.subject}</span>
            <span className="text-xs text-muted-foreground">
              {format(log.createdAt, 'd. M. yyyy, HH:mm')}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={log.status === 'sent' ? 'secondary' : 'destructive'}>
              {log.status === 'sent' ? 'Poslano' : 'Napaka'}
            </Badge>
            {log.status === 'failed' && (
              <Button
                variant="outline"
                size="sm"
                disabled={retrying === log.id}
                onClick={() => handleRetry(log.id)}
              >
                <RefreshCwIcon className={retrying === log.id ? 'animate-spin' : ''} />
                Poskusi znova
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
