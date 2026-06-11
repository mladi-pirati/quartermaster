'use client'

import {
  createShippingOption,
  deleteShippingOption,
  toggleShippingOption,
  updateShippingOption,
} from '@/actions/shipping-options'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import type { ShippingOption } from '@/db/schema'
import { formatPrice, parsePriceInput } from '@/lib/format'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface ShippingOptionManagerProps {
  initialOptions: ShippingOption[]
}

interface OptionFormValues {
  name: string
  price: number
}

function ShippingOptionForm({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues?: OptionFormValues
  onSubmit: (data: OptionFormValues) => Promise<void>
  loading: boolean
}) {
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [priceInput, setPriceInput] = useState(
    defaultValues ? String(defaultValues.price / 100) : '',
  )

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    await onSubmit({
      name: name.trim(),
      price: parsePriceInput(priceInput),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="opt-name">Name</Label>
        <Input
          id="opt-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Standard Shipping"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="opt-price">Price (€)</Label>
        <Input
          id="opt-price"
          type="number"
          min="0"
          step="0.01"
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>
      <SheetFooter className="mt-auto">
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Saving…' : 'Save'}
        </Button>
      </SheetFooter>
    </form>
  )
}

export function ShippingOptionManager({ initialOptions }: ShippingOptionManagerProps) {
  const [options, setOptions] = useState<ShippingOption[]>(initialOptions)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ShippingOption | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCreate(data: OptionFormValues) {
    setLoading(true)
    const result = await createShippingOption(data)
    setLoading(false)
    if (result.success) {
      setOptions((prev) => [result.data, ...prev])
      setCreateOpen(false)
      toast.success('Shipping option created')
    } else {
      toast.error(result.error)
    }
  }

  async function handleUpdate(data: OptionFormValues) {
    if (!editTarget) return
    setLoading(true)
    const result = await updateShippingOption(editTarget.id, data)
    setLoading(false)
    if (result.success) {
      setOptions((prev) =>
        prev.map((o) => (o.id === result.data.id ? result.data : o)),
      )
      setEditTarget(null)
      toast.success('Shipping option updated')
    } else {
      toast.error(result.error)
    }
  }

  async function handleToggle(id: string) {
    const result = await toggleShippingOption(id)
    if (result.success) {
      setOptions((prev) =>
        prev.map((o) => (o.id === result.data.id ? result.data : o)),
      )
    } else {
      toast.error('Failed to update shipping option')
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteShippingOption(id)
    if (result.success) {
      setOptions((prev) => prev.filter((o) => o.id !== id))
      toast.success('Shipping option deleted')
    } else {
      toast.error('Failed to delete shipping option')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Sheet open={createOpen} onOpenChange={setCreateOpen}>
          <SheetTrigger render={<Button />}>
            <PlusIcon />
            New option
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col gap-0 p-0">
            <SheetHeader className="border-b">
              <SheetTitle>New shipping option</SheetTitle>
            </SheetHeader>
            <ShippingOptionForm onSubmit={handleCreate} loading={loading} />
          </SheetContent>
        </Sheet>
      </div>

      {options.length === 0 ? (
        <p className="text-sm text-muted-foreground">No shipping options yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {options.map((option) => (
              <TableRow key={option.id}>
                <TableCell className="font-medium">{option.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatPrice(option.price)}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={option.isActive}
                    onCheckedChange={() => handleToggle(option.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Sheet
                      open={editTarget?.id === option.id}
                      onOpenChange={(open) =>
                        setEditTarget(open ? option : null)
                      }
                    >
                      <SheetTrigger
                        render={
                          <Button variant="ghost" size="icon-sm">
                            <PencilIcon />
                            <span className="sr-only">Edit</span>
                          </Button>
                        }
                      />
                      <SheetContent side="right" className="flex flex-col gap-0 p-0">
                        <SheetHeader className="border-b">
                          <SheetTitle>Edit shipping option</SheetTitle>
                        </SheetHeader>
                        <ShippingOptionForm
                          defaultValues={{
                            name: option.name,
                            price: option.price,
                          }}
                          onSubmit={handleUpdate}
                          loading={loading}
                        />
                      </SheetContent>
                    </Sheet>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(option.id)}
                    >
                      <Trash2Icon />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
