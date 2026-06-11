'use client'

import { deleteImage, reorderImages } from '@/actions/items'
import { DragDropProvider } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import { move } from '@dnd-kit/helpers'
import { ImageIcon, Trash2Icon, UploadIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

interface ImageRecord {
  id: string
  url: string
  s3Key: string
  sortOrder: number
}

interface ImageUploaderProps {
  itemId: string
  initialImages: ImageRecord[]
}

interface SortableImageProps {
  image: ImageRecord
  index: number
  onDelete: (id: string) => void
}

function SortableImage({ image, index, onDelete }: SortableImageProps) {
  const { ref, isDragging } = useSortable({ id: image.id, index })

  return (
    <div
      ref={ref}
      className={`group relative aspect-square overflow-hidden rounded-md border bg-muted transition-opacity ${isDragging ? 'opacity-40' : 'opacity-100'}`}
      style={{ cursor: 'grab' }}
    >
      <img
        src={image.url}
        alt=""
        className="h-full w-full object-cover"
        draggable={false}
      />
      {index === 0 && (
        <span className="absolute top-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
          Primary
        </span>
      )}
      <button
        type="button"
        onClick={() => onDelete(image.id)}
        className="absolute top-1 right-1 hidden rounded bg-black/60 p-1 text-white group-hover:flex"
      >
        <Trash2Icon className="size-3" />
        <span className="sr-only">Delete image</span>
      </button>
    </div>
  )
}

export function ImageUploader({ itemId, initialImages }: ImageUploaderProps) {
  const [images, setImages] = useState<ImageRecord[]>(
    [...initialImages].sort((a, b) => a.sortOrder - b.sortOrder),
  )
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList) {
    const file = files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are supported')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`/api/admin/items/${itemId}/images`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')
      const savedImage: ImageRecord = await res.json()

      setImages((prev) => [...prev, savedImage])
      toast.success('Image uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDelete(imageId: string) {
    const result = await deleteImage(imageId)
    if (result.success) {
      setImages((prev) => prev.filter((img) => img.id !== imageId))
      toast.success('Image removed')
    } else {
      toast.error('Failed to remove image')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <DragDropProvider
          onDragEnd={(event) => {
            const reordered = move(images, event)
            setImages(reordered)
            reorderImages(
              itemId,
              reordered.map((img) => img.id),
            )
          }}
        >
          {images.map((image, index) => (
            <SortableImage
              key={image.id}
              image={image}
              index={index}
              onDelete={handleDelete}
            />
          ))}
        </DragDropProvider>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-50"
        >
          {uploading ? (
            <UploadIcon className="size-5 animate-pulse" />
          ) : (
            <ImageIcon className="size-5" />
          )}
          <span className="text-xs">{uploading ? 'Uploading…' : 'Add image'}</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Drag to reorder · First image is the primary
        </p>
      )}
    </div>
  )
}
