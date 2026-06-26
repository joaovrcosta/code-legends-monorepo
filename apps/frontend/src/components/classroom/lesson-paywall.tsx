'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import freeIcon from '../../../public/free-plan-icon.svg'
import proIcon from '../../../public/pro-plan-icon.svg'
import premiumIcon from '../../../public/premium-plan-icon.svg'
import { PrimaryButton } from '../ui/primary-button'

const PLAN_ICONS = [
  { src: freeIcon, alt: 'Free' },
  { src: proIcon, alt: 'Pro' },
  { src: premiumIcon, alt: 'Premium' },
] as const

export function LessonPaywall() {
  return (
    <div className="relative flex min-h-full w-full flex-1 flex-col items-center justify-center overflow-hidden px-4 py-8 lg:min-h-0 lg:py-12">
      {/* Container principal com Glassmorphism */}
      <div className="relative w-full max-w-[560px] flex flex-col items-center text-center p-8 lg:p-12 rounded-[16px] transition-all duration-500">
        {/* Ícones dos planos (Free, Pro, Premium) - avatar stack */}
        <div className="relative z-10 flex items-center justify-center -space-x-3 mb-8 hover:space-x-0 transition-all duration-300">
          {PLAN_ICONS.map((plan) => (
            <div
              key={plan.alt}
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-zinc-950 bg-zinc-900 overflow-hidden transition-transform hover:scale-110 hover:z-20"
            >
              <Image
                src={plan.src}
                alt={plan.alt}
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
          ))}
        </div>

        {/* Textos com contraste melhorado */}
        <h1 className="relative z-10 text-2xl lg:text-3xl font-extrabold text-white mb-4 tracking-tight">
          Conteúdo exclusivo para assinantes
        </h1>
        <p className="relative z-10 text-sm lg:text-base text-zinc-400 mb-10 leading-relaxed max-w-[420px]">
          Assinando agora você recebe acesso imediato a todos os conteúdos do
          catálogo em uma única assinatura. Aprenda do zero ao avançado com
          projetos práticos e certificados.
        </p>

        {/* Botões modernizados */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/plans">
            <PrimaryButton className="rounded-full bg-blue-gradient-500 text-white hover:opacity-90 transition-all h-14 px-8 gap-3 border-0 text-sm font-bold">
              Quero assinar agora
            </PrimaryButton>
          </Link>
        </div>

        <div />
      </div>
    </div>
  )
}
