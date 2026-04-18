'use client'

import dynamic from 'next/dynamic'
import type { CodePlaygroundProps } from '@/components/code-playground-ui'

export type { CodePlaygroundProps } from '@/components/code-playground-ui'

function PlaygroundSkeleton({ height = 320 }: { height?: number | string }) {
  const heightValue = typeof height === 'number' ? `${height}px` : height
  return (
    <div
      className="flex w-full animate-pulse flex-col overflow-hidden rounded-lg border border-[#25252A] bg-[#1A1A1A]"
      style={{ height: heightValue, minHeight: heightValue }}
      aria-busy
      aria-label="Carregando playground"
    >
      <div className="h-11 border-b border-[#25252A] bg-[#373A3E]" />
      <div className="min-h-0 flex-1 bg-[#25252A]" />
    </div>
  )
}

const CodePlaygroundLazy = dynamic(
  () =>
    import('@/components/code-playground-ui').then((m) => m.CodePlayground),
  {
    ssr: false,
    loading: () => <PlaygroundSkeleton />,
  }
)

export function CodePlayground(props: CodePlaygroundProps) {
  return <CodePlaygroundLazy {...props} />
}
