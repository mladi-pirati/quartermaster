'use client'

import { deleteItem } from '@/actions/items'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface DeleteItemButtonProps {
  id: string
  name: string
}

export function DeleteItemButton({ id, name }: DeleteItemButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const result = await deleteItem(id)
    setLoading(false)
    if (result.success) {
      toast.success('Item deleted')
      setOpen(false)
    } else {
      toast.error('Failed to delete item')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm">
            <Trash2Icon />
            <span className="sr-only">Delete</span>
          </Button>
        }
      />
      <DialogContent showCloseButton={false} className="max-w-sm">
        <DialogTitle>Delete item</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete <strong>{name}</strong>? This will
          also remove all associated images and cannot be undone.
        </DialogDescription>
        <div className="mt-2 flex justify-end gap-2">
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
