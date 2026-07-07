import { Card, CardContent } from '../ui/card'
import Image from 'next/image'
import { getSubscriptionForAccount } from '@/actions/account/get-subscription'
import { AccountCardHeader } from './account-card-header'

export async function MySubscriptions() {
  const { planInfo, hasPaidPlan } = await getSubscriptionForAccount()
  if (!planInfo) {
    return null
  }

  return (
    <Card className="rounded-[20px] border-[#25252a] bg-primary p-0">
      <AccountCardHeader
        title="Assinatura & Compras"
        manageHref="/account/purchases"
      />

      <CardContent className="px-6 pb-6 pt-0">
        {hasPaidPlan ? (
          <div className="flex items-center gap-4">
            <Image
              src={planInfo.icon}
              alt={planInfo.title}
              width={32}
              height={32}
            />
            <div>
              <h3 className="font-medium text-white">{planInfo.title}</h3>
              <p className="text-sm text-muted">
                {planInfo.description}
              </p>
              {planInfo.expirationDate && (
                <p className="mt-1 text-sm text-muted">
                  Expira em {planInfo.expirationDate}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Não há registro de assinatura na sua conta.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
