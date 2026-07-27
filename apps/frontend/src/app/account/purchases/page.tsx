import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { CreditCard, Calendar, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSubscriptionForAccount } from '@/actions/account/get-subscription'
import { listPlans } from '@/actions/plan/list-plans'
import { isOnHighestPaidPlan } from '@/lib/plan-utils'
import { getCurrentSession } from '@/actions/auth'

export default async function AccountPurchasesPage() {
  const session = await getCurrentSession()

  if (!session) {
    redirect('/login')
  }

  const subscription = await getSubscriptionForAccount()
  const { plans } = await listPlans()

  const userPlan = session.plan ?? 'FREE'

  const planInfo = subscription?.planInfo ?? null
  const currentPlanSlug = subscription.planSlug ?? userPlan

  const hasActiveSubscription =
    subscription?.hasPaidPlan ?? (userPlan === 'PRO' || userPlan === 'PREMIUM')

  const isHighestPlan = isOnHighestPaidPlan(currentPlanSlug, plans)

  const nextRenewalDate = planInfo?.expirationDate ?? null

  const displayColorHex =
    planInfo?.colorHex ??
    (userPlan === 'PRO'
      ? '#8234E9'
      : userPlan === 'PREMIUM'
        ? '#FF6200'
        : '#00c8ff')

  const paymentMethod = null
  const lastPaymentDate = null

  return (
    <div className="w-full">
      <Card className="bg-primary border-[#25252a] lg:p-8 p-4 text-zinc-100 rounded-[20px]">
        <CardHeader className="px-0 pt-0 pb-8">
          <div className="flex items-center justify-between border-b border-[#25252a] pb-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-white">
                  Assinatura e pagamento
                </h1>
              </div>

              <p className="text-sm text-muted">
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

            {hasActiveSubscription && planInfo ? (
              <div className="flex flex-col gap-4 p-5 rounded-2xl border border-[#25252a] bg-surface-2/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#25252a]">
                      <Image
                        src={planInfo.icon}
                        alt={planInfo.title}
                        width={32}
                        height={32}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-semibold"
                          style={{ color: displayColorHex }}
                        >
                          {planInfo.title}
                        </span>

                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#25252a] text-muted">
                          Ativo
                        </span>
                      </div>

                      <p className="text-sm text-muted mt-1">
                        {planInfo.description}
                      </p>
                    </div>
                  </div>

                  {nextRenewalDate && (
                    <div className="flex items-center gap-2 text-sm text-muted shrink-0">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Próxima renovação:{' '}
                        {new Date(nextRenewalDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>

                {!isHighestPlan && (
                  <Button
                    asChild
                    variant="outline"
                    className="h-[52px] w-full rounded-full border-[#25252A] bg-transparent text-white shadow-none hover:bg-[#25252A] hover:text-[#00c8ff] hover:border-[#00c8ff]/30"
                  >
                    <Link href="/plans">Alterar plano</Link>
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted">
                Não há registro de assinatura na sua conta.
              </p>
            )}
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

                    <p className="text-sm text-muted mt-0.5">
                      {paymentMethod}
                    </p>

                    {lastPaymentDate && (
                      <p className="text-xs text-muted mt-1">
                        Última cobrança:{' '}
                        {new Date(lastPaymentDate).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="h-[52px] rounded-full border-[#25252a] text-muted hover:text-[#00c8ff] hover:border-[#00c8ff]/30 shrink-0"
                >
                  Alterar
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted">
                Não há registro de pagamentos na sua conta.
              </p>
            )}

            {hasActiveSubscription && (
              <div className="flex items-center gap-3 p-4 rounded-xl border border-[#25252a] bg-[#0d2818]/30 border-l-4 border-l-[#B8E62E]">
                <CheckCircle className="w-5 h-5 text-[#B8E62E] shrink-0" />
                <p className="text-sm text-muted">
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
