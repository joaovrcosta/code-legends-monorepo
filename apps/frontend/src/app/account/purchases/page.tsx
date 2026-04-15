import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Crown, CreditCard, Calendar, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSubscriptionForAccount } from '@/actions/account/get-subscription'
import { getCurrentSession } from '@/actions/auth'

export default async function AccountPurchasesPage() {
  const session = await getCurrentSession()

  if (!session) {
    redirect('/login')
  }

  const subscription = await getSubscriptionForAccount()

  const userPlan = session.plan ?? 'FREE'

  const planInfo = subscription?.planInfo ?? null

  const hasActiveSubscription =
    subscription?.hasPaidPlan ?? (userPlan === 'PRO' || userPlan === 'PREMIUM')

  const displayTitle = planInfo?.title ?? 'Plano gratuito'

  const displayDescription =
    planInfo?.description ?? 'Acesso a conteúdos gratuitos do catálogo.'

  const displayIcon = planInfo?.icon ?? '/free-plan-icon.svg'

  const nextRenewalDate = planInfo?.expirationDate ?? null

  const displayColorHex =
    planInfo?.colorHex ??
    (userPlan === 'PRO'
      ? '#8234E9'
      : userPlan === 'PREMIUM'
        ? '#FF6200'
        : '#B8E62E')

  const paymentMethod = null
  const lastPaymentDate = null

  return (
    <div className="w-full mt-8">
      <Card className="bg-surface border-[#25252a] lg:p-8 p-4 text-zinc-100">
        <CardHeader className="px-0 pt-0 pb-8">
          <div className="flex items-center justify-between border-b border-[#25252a] pb-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[#00c8ff]">
                  <Crown className="w-6 h-6" />
                </span>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#00c8ff] to-[#00ff88] bg-clip-text text-transparent">
                  Assinatura e pagamento
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Gerencie seu plano e forma de pagamento.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0 space-y-10">
          {/* ================= ASSINATURA ================= */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold text-white border-b border-[#25252a] pb-2">
              Assinatura
            </h2>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-[#25252a] bg-surface-2/50">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#25252a]">
                  <Image
                    src={displayIcon}
                    alt={displayTitle}
                    width={32}
                    height={32}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold" style={{ color: displayColorHex }}>
                      {displayTitle}
                    </span>

                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#25252a] text-muted-foreground">
                      {hasActiveSubscription ? 'Ativo' : 'Gratuito'}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mt-1">
                    {displayDescription}
                  </p>
                </div>
              </div>

              {hasActiveSubscription && nextRenewalDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Próxima renovação:{' '}
                    {new Date(nextRenewalDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}

              <div className="shrink-0">
                {!hasActiveSubscription ? (
                  <Button
                    asChild
                    className="h-[52px] rounded-full bg-[#00c8ff] text-white hover:opacity-90 px-6"
                  >
                    <Link href="/plans">Conhecer planos</Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant="outline"
                    className="h-[52px] rounded-full border-[#25252a] text-muted-foreground hover:text-[#00c8ff] hover:border-[#00c8ff]/30 px-6"
                  >
                    <Link href="/plans">Alterar plano</Link>
                  </Button>
                )}
              </div>
            </div>
          </section>

          {/* ================= PAGAMENTO ================= */}
          <section className="space-y-4 pt-6 border-t border-[#25252a]">
            <h2 className="text-base font-semibold text-white border-b border-[#25252a] pb-2">
              Pagamento
            </h2>

            {paymentMethod ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-[#25252a] bg-surface-2/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#25252a]">
                    <CreditCard className="w-6 h-6 text-[#00c8ff]" />
                  </div>

                  <div>
                    <p className="font-medium text-white">Forma de pagamento</p>

                    <p className="text-sm text-muted-foreground mt-0.5">
                      {paymentMethod}
                    </p>

                    {lastPaymentDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Última cobrança:{' '}
                        {new Date(lastPaymentDate).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="h-[52px] rounded-full border-[#25252a] text-muted-foreground hover:text-[#00c8ff] hover:border-[#00c8ff]/30 shrink-0"
                >
                  Alterar
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-dashed border-[#25252a] bg-surface-2/30">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#25252a]">
                    <CreditCard className="w-6 h-6 text-muted-foreground" />
                  </div>

                  <div>
                    <p className="font-medium text-white">
                      Nenhum método de pagamento
                    </p>

                    <p className="text-sm text-muted-foreground mt-0.5">
                      Adicione um cartão para assinar um plano pago.
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  className="h-[52px] rounded-full bg-[#00c8ff] text-white hover:opacity-90 shrink-0"
                >
                  <Link href="/plans">Ver planos</Link>
                </Button>
              </div>
            )}

            {hasActiveSubscription && (
              <div className="flex items-center gap-3 p-4 rounded-xl border border-[#25252a] bg-[#0d2818]/30 border-l-4 border-l-[#B8E62E]">
                <CheckCircle className="w-5 h-5 text-[#B8E62E] shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Sua assinatura está ativa. Você tem acesso a todo o conteúdo
                  do seu plano até a próxima data de renovação.
                </p>
              </div>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
