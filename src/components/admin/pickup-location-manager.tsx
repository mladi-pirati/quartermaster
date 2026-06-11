'use client'

import {
  createPickupLocation,
  deletePickupLocation,
  togglePickupLocation,
  updatePickupLocation,
} from '@/actions/pickup-locations'
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
import type { PickupLocation } from '@/db/schema'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface PickupLocationManagerProps {
  initialLocations: PickupLocation[]
}

interface LocationFormValues {
  name: string
  address: string
  city: string
  country: string
}

function LocationForm({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues?: LocationFormValues
  onSubmit: (data: LocationFormValues) => Promise<void>
  loading: boolean
}) {
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [address, setAddress] = useState(defaultValues?.address ?? '')
  const [city, setCity] = useState(defaultValues?.city ?? '')
  const [country, setCountry] = useState(defaultValues?.country ?? '')

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    await onSubmit({ name: name.trim(), address: address.trim(), city: city.trim(), country: country.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="loc-name">Name</Label>
        <Input
          id="loc-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Ljubljana, Miklošičeva 4"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="loc-address">Address</Label>
        <Input
          id="loc-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street and number"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="loc-city">City</Label>
        <Input
          id="loc-city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Ljubljana"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="loc-country">Country</Label>
        <Input
          id="loc-country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Slovenia"
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

export function PickupLocationManager({
  initialLocations,
}: PickupLocationManagerProps) {
  const [locations, setLocations] = useState<PickupLocation[]>(initialLocations)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<PickupLocation | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCreate(data: LocationFormValues) {
    setLoading(true)
    const result = await createPickupLocation(data)
    setLoading(false)
    if (result.success) {
      setLocations((prev) => [result.data, ...prev])
      setCreateOpen(false)
      toast.success('Location created')
    } else {
      toast.error(result.error)
    }
  }

  async function handleUpdate(data: LocationFormValues) {
    if (!editTarget) return
    setLoading(true)
    const result = await updatePickupLocation(editTarget.id, data)
    setLoading(false)
    if (result.success) {
      setLocations((prev) =>
        prev.map((l) => (l.id === result.data.id ? result.data : l)),
      )
      setEditTarget(null)
      toast.success('Location updated')
    } else {
      toast.error(result.error)
    }
  }

  async function handleToggle(id: string) {
    const result = await togglePickupLocation(id)
    if (result.success) {
      setLocations((prev) =>
        prev.map((l) => (l.id === result.data.id ? result.data : l)),
      )
    } else {
      toast.error('Failed to update location')
    }
  }

  async function handleDelete(id: string) {
    const result = await deletePickupLocation(id)
    if (result.success) {
      setLocations((prev) => prev.filter((l) => l.id !== id))
      toast.success('Location deleted')
    } else {
      toast.error('Failed to delete location')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Sheet open={createOpen} onOpenChange={setCreateOpen}>
          <SheetTrigger render={<Button />}>
            <PlusIcon />
            New location
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col gap-0 p-0">
            <SheetHeader className="border-b">
              <SheetTitle>New pickup location</SheetTitle>
            </SheetHeader>
            <LocationForm onSubmit={handleCreate} loading={loading} />
          </SheetContent>
        </Sheet>
      </div>

      {locations.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pickup locations yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location.id}>
                <TableCell className="font-medium">{location.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {location.address}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {location.city}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {location.country}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={location.isActive}
                    onCheckedChange={() => handleToggle(location.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Sheet
                      open={editTarget?.id === location.id}
                      onOpenChange={(open) =>
                        setEditTarget(open ? location : null)
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
                          <SheetTitle>Edit location</SheetTitle>
                        </SheetHeader>
                        <LocationForm
                          defaultValues={{
                            name: location.name,
                            address: location.address,
                            city: location.city,
                            country: location.country,
                          }}
                          onSubmit={handleUpdate}
                          loading={loading}
                        />
                      </SheetContent>
                    </Sheet>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(location.id)}
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
