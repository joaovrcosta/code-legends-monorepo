import { Crown } from '@phosphor-icons/react/dist/ssr'
import { Card, CardHeader, CardContent } from '../ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { getSubscriptionForAccount } from '@/actions/account/get-subscription'

export async function MySubscriptions() {
  const { planInfo, hasPaidPlan } = await getSubscriptionForAccount()
  if (!planInfo) {
    return null
  }

  return (
    <Card className="bg-surface rounded-[20px] border-[#25252a] p-4">
      <CardHeader className="px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-blue-gradient-500">
              <Crown className="w-6 h-6 text-[#00c8ff]" />
            </span>
            <h1 className="text-lg font-semibold bg-blue-gradient-500 bg-clip-text text-transparent">
              Assinatura
            </h1>
          </div>
          <Link href="/account/purchases">
            <span className="text-sm text-muted-foreground hover:text-[#00c8ff] transition-colors">
              Gerenciar
            </span>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-0">
        {hasPaidPlan ? (
          <div className="space-y-2 bg-[#1a1a1e] rounded-[20px] p-4 flex items-center gap-4 mt-2">
            <div>
              <Image
                src={planInfo.icon}
                alt={planInfo.title}
                width={32}
                height={32}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {planInfo.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {planInfo.description}
              </p>
            </div>
            {planInfo.expirationDate && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Expira em {planInfo.expirationDate}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Conheça nossos planos e tenha acesso a todo o catálogo,
              certificados e mais.
            </p>
            <Link
              href="/account/purchases"
              className="text-sm text-[#00c8ff] hover:underline inline-block"
            >
              Conhecer planos
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
