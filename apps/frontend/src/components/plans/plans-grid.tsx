'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { StaticImageData } from 'next/image'
import freeIcon from '../../../public/free-plan-icon.svg'
import proIcon from '../../../public/pro-plan-icon.svg'
import premiumIcon from '../../../public/premium-plan-icon.svg'
import type { PlanFromAPI } from '@/actions/plan/list-plans'

export type PlanId = 'free' | 'pro' | 'premium' | (string & {})

export type PlanCardData = {
  id: PlanId
  badge?: string
  badgeVariant?: 'alert' | 'limited' | 'highlight'
  labelAboveTitle?: string
  title: string
  shortDescription?: string
  price?: string
  priceSub?: string
  features: string[]
  ctaLabel: string
  ctaHref: string
  ctaVariant?: 'primary' | 'secondary'
  iconStyle?: 'silver' | 'glass' | 'iridescent'
  iconSrc?: StaticImageData
  iconGradient?: 'free' | 'pro' | 'premium'
}

const FREE_PLAN: PlanCardData = {
  id: 'free',
  badge: 'Grátis',
  badgeVariant: 'highlight',
  labelAboveTitle: 'Grátis',
  title: 'FREE',
  shortDescription: 'Comece com aulas gratuitas e avalie o método.',
  features: [
    'Aulas gratuitas selecionadas.',
    'Acesso à comunidade e conteúdo introdutório.',
  ],
  ctaLabel: 'Começar grátis',
  ctaHref: '/learn/catalog',
  ctaVariant: 'secondary',
  iconStyle: 'silver',
  iconSrc: freeIcon,
  iconGradient: 'free',
}

function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function apiPlanToCardData(plan: PlanFromAPI, index: number): PlanCardData {
  const slug = plan.slug.toLowerCase()
  const isPro = slug === 'pro'
  const isPremium = slug === 'premium'
  const installmentCents = Math.round(plan.amountCents / 12)
  const features = plan.description
    ? plan.description
        .split(/[.;]\s*/)
        .filter(Boolean)
        .map((s) => s.trim())
    : [plan.description ?? 'Acesso completo ao plano.']

  return {
    id: slug,
    badge: isPremium ? 'Mais completo' : undefined,
    badgeVariant: isPremium ? 'limited' : undefined,
    title: plan.name,
    shortDescription: plan.description ?? undefined,
    price: formatBRL(plan.amountCents),
    priceSub: `12x de ${formatBRL(installmentCents)}`,
    features,
    ctaLabel: 'Assinar',
    ctaHref: `/cart/${slug}`,
    ctaVariant: isPro || index === 0 ? 'primary' : 'secondary',
    iconStyle: isPro ? 'glass' : isPremium ? 'iridescent' : 'glass',
    iconSrc: isPro ? proIcon : isPremium ? premiumIcon : proIcon,
    iconGradient: isPro ? 'pro' : isPremium ? 'premium' : 'pro',
  }
}

function IconGlow({
  gradient,
  children,
}: {
  gradient?: PlanCardData['iconGradient']
  children: React.ReactNode
}) {
  if (!gradient) return <>{children}</>
  const glowClass =
    gradient === 'free'
      ? 'shadow-[0_0_40px_rgba(163,230,53,0.25),0_0_80px_rgba(74,222,128,0.15)]'
      : gradient === 'pro'
        ? 'shadow-[0_0_40px_rgba(139,92,246,0.3),0_0_80px_rgba(124,58,237,0.15)]'
        : 'shadow-[0_0_40px_rgba(249,115,22,0.25),0_0_80px_rgba(239,68,68,0.15)]'
  return (
    <div
      className={cn('rounded-full flex items-center justify-center', glowClass)}
    >
      {children}
    </div>
  )
}

function PlanIcon({ style }: { style?: PlanCardData['iconStyle'] }) {
  const ring = 'rounded-full border-[3px] shrink-0'
  switch (style) {
    case 'silver':
      return (
        <div
          className={cn(
            'w-24 h-24 lg:w-28 lg:h-28 flex items-center justify-center',
            'bg-gradient-to-br from-zinc-500 to-zinc-300 shadow-lg border border-zinc-400/50 rounded-full',
            'ring-2 ring-zinc-600/30',
          )}
        >
          <div
            className={cn(ring, 'w-14 h-14 border-zinc-600/50 bg-transparent')}
          />
        </div>
      )
    case 'glass':
      return (
        <div
          className={cn(
            'w-24 h-24 lg:w-28 lg:h-28 flex items-center justify-center rounded-full',
            'bg-cyan-500/25 border border-cyan-400/50',
            'shadow-[inset_0_0_30px_rgba(34,211,238,0.2),0_0_20px_rgba(34,211,238,0.1)]',
          )}
        >
          <div
            className={cn(ring, 'w-14 h-14 border-cyan-400/60 bg-transparent')}
          />
        </div>
      )
    case 'iridescent':
      return (
        <div
          className={cn(
            'w-24 h-24 lg:w-28 lg:h-28 flex items-center justify-center rounded-full',
            'bg-gradient-to-br from-cyan-400 via-purple-400 to-pink-400',
            'shadow-lg border border-white/30',
          )}
        >
          <div
            className={cn(ring, 'w-14 h-14 border-white/50 bg-transparent')}
          />
        </div>
      )
    default:
      return (
        <div className="w-24 h-24 lg:w-28 lg:h-28 flex items-center justify-center rounded-full bg-[#25252A] border border-[#2A2A2A]">
          <div
            className={cn(ring, 'w-14 h-14 border-zinc-600 bg-transparent')}
          />
        </div>
      )
  }
}

import { ArrowUpRight, CheckCircle } from '@phosphor-icons/react/dist/ssr'

function PlanCard({ plan }: { plan: PlanCardData }) {
  const badgeClass =
    plan.badgeVariant === 'highlight'
      ? 'bg-lime-500/10 text-lime-400 border-lime-500/20'
      : plan.badgeVariant === 'alert'
        ? 'bg-red-500/10 text-red-400 border-red-500/20'
        : 'bg-white/5 text-zinc-300 border-white/10'

  const isPro = plan.id === 'pro'
  const isFree = plan.id === 'free'
  const checkColor = isFree
    ? 'text-lime-400'
    : isPro
      ? 'text-purple-400'
      : 'text-orange-400'

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-[24px] p-6 lg:p-8 transition-all duration-500 ease-out',
        'bg-zinc-950/60 backdrop-blur-xl',
        isPro
          ? 'border-2 border-purple-500/30 shadow-[0_0_80px_-20px_rgba(139,92,246,0.15)] md:-translate-y-4 hover:border-purple-500/60 md:hover:-translate-y-6'
          : 'border border-white/5 hover:border-white/20 hover:-translate-y-2 hover:bg-zinc-900/60',
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[24px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at 50% 0%, ${isPro ? 'rgba(139,92,246,0.05)' : 'rgba(255,255,255,0.03)'}, transparent 40%)`,
        }}
      />

      {/* Badge canto superior esquerdo */}
      {plan.badge && (
        <span
          className={cn(
            'absolute top-5 left-6 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border',
            badgeClass,
          )}
        >
          {plan.badge}
        </span>
      )}

      {/* Ícone com espaçamento melhorado */}
      <div className="flex justify-start pt-12 pb-6">
        <IconGlow gradient={plan.iconGradient}>
          {plan.iconSrc ? (
            <div className="relative w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
              <Image
                src={plan.iconSrc}
                alt={plan.title}
                width={80}
                height={80}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <PlanIcon style={plan.iconStyle} />
          )}
        </IconGlow>
      </div>

      {/* Label acima do título */}
      {plan.labelAboveTitle && (
        <span className="text-sm font-medium text-zinc-400 uppercase tracking-widest block mb-2">
          {plan.labelAboveTitle}
        </span>
      )}

      {/* Título e Preço */}
      <div className="flex items-end justify-between gap-3 mb-1">
        <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          {plan.title}
        </h2>
        {plan.price && (
          <span className="text-2xl font-bold text-white whitespace-nowrap">
            {plan.price}
          </span>
        )}
      </div>

      {/* Subtítulo do preço alinhado à direita se houver preço */}
      <div className="flex justify-between min-h-[20px] mb-6">
        <p className="text-sm text-zinc-400 leading-relaxed max-w-[70%]">
          {plan.shortDescription}
        </p>
        {plan.priceSub && (
          <p className="text-sm font-medium text-zinc-500 text-right">
            {plan.priceSub}
          </p>
        )}
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

      {/* Lista de características - REMOVIDO O UPPERCASE E ADICIONADO ÍCONE */}
      <ul className="space-y-4 mb-10 flex-1">
        {plan.features.map((feature, i) => (
          <li
            key={i}
            className="flex items-start gap-3 text-sm text-zinc-300 leading-relaxed"
          >
            <CheckCircle
              size={20}
              weight="fill"
              className={cn('shrink-0 mt-0.5', checkColor)}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* Botões modernizados */}
      <Link href={plan.ctaHref} className="block mt-auto relative z-10">
        {plan.ctaVariant === 'primary' ? (
          <span className="w-full h-14 rounded-full bg-white text-black text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            {plan.ctaLabel}
            <ArrowUpRight size={20} weight="bold" />
          </span>
        ) : (
          <span className="w-full h-14 rounded-full border border-white/10 bg-white/5 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/10 hover:border-white/20 transition-all hover:scale-[1.02]">
            {plan.ctaLabel}
            <ArrowUpRight
              size={20}
              weight="bold"
              className="text-zinc-400 group-hover:text-white transition-colors"
            />
          </span>
        )}
      </Link>
    </article>
  )
}

interface PlansGridProps {
  apiPlans?: PlanFromAPI[]
}

export function PlansGrid({ apiPlans = [] }: PlansGridProps) {
  // Já temos um card FREE fixo; evita duplicar caso a API também retorne "free".
  const paidCards = apiPlans
    .filter((p) => p.slug.toLowerCase() !== 'free')
    .map((p, i) => apiPlanToCardData(p, i))
  const plansData: PlanCardData[] = [FREE_PLAN, ...paidCards]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
      {plansData.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  )
}
