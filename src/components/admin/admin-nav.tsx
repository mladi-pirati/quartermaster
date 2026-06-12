'use client'

import { cn } from '@/lib/utils'
import { PackageIcon, ShoppingBagIcon, MapPinIcon, TruckIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin/items', label: 'Items', icon: PackageIcon },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBagIcon },
  { href: '/admin/pickup-locations', label: 'Pickup Locations', icon: MapPinIcon },
  { href: '/admin/shipping-options', label: 'Shipping Options', icon: TruckIcon },
]

interface AdminNavProps {
  user: { fullName: string; username: string }
}

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 p-2 flex-1">
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
      <div className="mt-auto pt-2">
        <Link
          href="/admin/profile"
          className={cn(
            'flex items-center gap-2.5 rounded-md px-3 py-2 transition-colors',
            pathname.startsWith('/admin/profile')
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          )}
        >
          <UserIcon className="size-4 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">{user.fullName}</span>
            <span className="text-xs truncate">@{user.username}</span>
          </div>
        </Link>
      </div>
    </nav>
  )
}
