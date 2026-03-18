import { KeyRound } from 'lucide-react'
import { Card, CardHeader, CardContent } from '../ui/card'
import Link from 'next/link'
import { getCurrentUser } from '@/actions/user/get-current-user'

export async function MyAccess() {
  const user = await getCurrentUser()
  const email = user?.email ?? ''

  return (
    <Card className="bg-surface rounded-[20px] border-[#25252a] p-4">
      <CardHeader className="px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-blue-gradient-500">
              <KeyRound className="w-6 h-6 text-[#00c8ff]" />
            </span>
            <h1 className="text-lg font-semibold bg-blue-gradient-500 bg-clip-text text-transparent">
              Meus dados
            </h1>
          </div>
          <Link href="/account/access">
            <span className="text-sm text-muted-foreground hover:text-[#00c8ff] transition-colors">
              Gerenciar
            </span>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-0">
        <p className="text-sm text-muted-foreground">Conta atual</p>
        <p className="text-sm text-zinc-200 font-medium mt-1">{email || '—'}</p>
      </CardContent>
    </Card>
  )
}
