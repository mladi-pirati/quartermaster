'use client'

import { createItem, updateItem } from '@/actions/items'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploader } from '@/components/admin/image-uploader'
import { parsePriceInput } from '@/lib/format'
import type { Item, ItemImage } from '@/db/schema'
import { XIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

interface ItemFormProps {
  item?: Item
  images?: ItemImage[]
}

export function ItemForm({ item, images = [] }: ItemFormProps) {
  const router = useRouter()
  const isEdit = Boolean(item)

  const [name, setName] = useState(item?.name ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [priceInput, setPriceInput] = useState(
    item ? (item.price / 100).toFixed(2) : '',
  )
  const [status, setStatus] = useState<'draft' | 'active' | 'inactive'>(
    item?.status ?? 'draft',
  )
  const [sizes, setSizes] = useState<string[]>(item?.sizes ?? [])
  const [sizeInput, setSizeInput] = useState('')
  const [loading, setLoading] = useState(false)
  const sizeInputRef = useRef<HTMLInputElement>(null)

  function addSize(value: string) {
    const trimmed = value.trim()
    if (trimmed && !sizes.includes(trimmed)) {
      setSizes((prev) => [...prev, trimmed])
    }
    setSizeInput('')
  }

  function removeSize(size: string) {
    setSizes((prev) => prev.filter((s) => s !== size))
  }

  function handleSizeKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSize(sizeInput)
    }
    if (e.key === 'Backspace' && sizeInput === '' && sizes.length > 0) {
      setSizes((prev) => prev.slice(0, -1))
    }
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()

    const price = parsePriceInput(priceInput)
    if (!name.trim()) return toast.error('Name is required')
    if (!description.trim()) return toast.error('Description is required')
    if (price <= 0) return toast.error('Price must be greater than 0')

    setLoading(true)
    const data = { name: name.trim(), description: description.trim(), price, sizes, status }
    const result = isEdit
      ? await updateItem(item!.id, data)
      : await createItem(data)

    setLoading(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success(isEdit ? 'Item updated' : 'Item created')
    if (!isEdit) router.push(`/admin/items/${result.data.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {isEdit ? `Edit: ${item!.name}` : 'New item'}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/items')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create item'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_480px] gap-6">
        {/* Left: details */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pirate T-Shirt"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the item…"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price">Price (EUR)</Label>
              <Input
                id="price"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Sizes</Label>
            <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-input px-2.5 py-1.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
              {sizes.map((size) => (
                <span
                  key={size}
                  className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-sm"
                >
                  {size}
                  <button
                    type="button"
                    onClick={() => removeSize(size)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <XIcon className="size-3" />
                    <span className="sr-only">Remove {size}</span>
                  </button>
                </span>
              ))}
              <input
                ref={sizeInputRef}
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                onKeyDown={handleSizeKeyDown}
                onBlur={() => sizeInput.trim() && addSize(sizeInput)}
                placeholder={sizes.length === 0 ? 'Add sizes (press Enter)…' : ''}
                className="min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Press Enter or comma to add a size
            </p>
          </div>
        </div>

        {/* Right: images */}
        <div className="flex flex-col gap-1.5">
          <Label>Images</Label>
          {isEdit ? (
            <ImageUploader itemId={item!.id} initialImages={images} />
          ) : (
            <p className="text-xs text-muted-foreground">
              Save the item first, then upload images.
            </p>
          )}
        </div>
      </div>
    </form>
  )
}
