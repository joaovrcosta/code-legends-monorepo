import { Card, CardContent } from '../ui/card'
import { getCurrentUser } from '@/actions/user/get-current-user'
import { AccountCardHeader } from './account-card-header'

export async function MyAccess() {
  const user = await getCurrentUser()
  const email = user?.email ?? ''

  return (
    <Card className="rounded-[20px] border-[#25252a] bg-primary p-0 ">
      <AccountCardHeader
        title="Dados de acesso"
        manageHref="/account/access"
      />

      <CardContent className="px-6 pb-6 pt-0">
        <p className="text-sm text-muted-foreground">Conta atual</p>
        <p className="mt-1 text-sm font-medium text-white">{email || '—'}</p>
      </CardContent>
    </Card>
  )
}
