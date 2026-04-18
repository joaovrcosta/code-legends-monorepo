'use client'

import dynamic from 'next/dynamic'
import type { ChallengeBlockProps } from '@/components/classroom/challenge/ChallengeBlock'

const ChallengeBlockLazy = dynamic(
  () =>
    import('@/components/classroom/challenge/ChallengeBlock').then(
      (m) => m.ChallengeBlock,
    ),
  {
    loading: () => (
      <div
        className="my-6 min-h-[12rem] animate-pulse rounded-xl border border-white/10 bg-white/[0.03]"
        aria-busy
        aria-label="Carregando desafio"
      />
    ),
  },
)

export function ChallengeBlock(props: ChallengeBlockProps) {
  return <ChallengeBlockLazy {...props} />
}
