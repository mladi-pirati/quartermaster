import { getHelm } from '@/lib/helm'

export default async function ProfilePage() {
  const helm = await getHelm()
  const user = await helm.user.me()

  return (
    <div className="overflow-auto">
      <pre className="font-mono text-sm bg-muted rounded-lg p-4 overflow-auto">
        <code>{JSON.stringify(user, null, 2)}</code>
      </pre>
    </div>
  )
}
