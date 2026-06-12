export const dynamic = 'force-dynamic'

import { AdminNav } from '@/components/admin/admin-nav'
import { requireUser } from '@/lib/auth/session'
import { Separator } from '@/components/ui/separator'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 min-h-0">
        <aside className="flex w-56 shrink-0 flex-col border-r overflow-y-auto">
          <div className="flex h-12 items-center px-4">
            <span className="text-sm font-semibold">Quartermaster</span>
          </div>
          <Separator />
          <AdminNav user={{ fullName: user.fullName, username: user.username }} />
        </aside>
        <main className="flex flex-1 min-h-0 flex-col overflow-hidden p-6">{children}</main>
      </div>
    </div>
  )
}
