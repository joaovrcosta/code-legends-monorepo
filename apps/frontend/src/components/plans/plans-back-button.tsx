'use client'

import { useRouter } from 'next/navigation'
import { CaretLeft } from '@phosphor-icons/react'

export function PlansBackButton() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Voltar"
      className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-[#C4C4CC] transition-colors hover:bg-white/5 hover:text-white"
    >
      <CaretLeft size={22} weight="bold" />
    </button>
  )
}
