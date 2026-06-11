'use client'

import { cn } from '@/lib/utils'
import { PackageIcon, ShoppingBagIcon, MapPinIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin/items', label: 'Items', icon: PackageIcon },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBagIcon },
  { href: '/admin/pickup-locations', label: 'Pickup Locations', icon: MapPinIcon },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 p-2">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            pathname.startsWith(href)
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          )}
        >
          <Icon className="size-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  )
}
