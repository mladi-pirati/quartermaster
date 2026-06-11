import { AdminNav } from '@/components/admin/admin-nav'
import { Separator } from '@/components/ui/separator'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r">
        <div className="flex h-12 items-center px-4">
          <span className="text-sm font-semibold">Quartermaster</span>
        </div>
        <Separator />
        <AdminNav />
      </aside>
      <main className="flex flex-1 flex-col p-6">{children}</main>
    </div>
  )
}
