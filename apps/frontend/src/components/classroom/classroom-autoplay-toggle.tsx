'use client'

import { useEffect } from 'react'
import { Play } from '@phosphor-icons/react'
import { useClassroomAutoplayStore } from '@/stores/classroom-autoplay-store'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
}

export function ClassroomAutoplayToggle({ className }: Props) {
  const {
    isAutoplayEnabled,
    hydrated,
    hydrate,
    setAutoplayEnabled,
  } = useClassroomAutoplayStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const enabled = hydrated && isAutoplayEnabled

  const toggle = () => setAutoplayEnabled(!isAutoplayEnabled)

  return (
    <div
      role="switch"
      aria-checked={enabled}
      aria-label="Reprodução automática entre vídeos"
      title="Avança para o próximo vídeo ao terminar"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation()
        toggle()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          e.stopPropagation()
          toggle()
        }
      }}
      className={cn(
        'hidden lg:flex items-center gap-2 rounded-full border border-[#25252A] bg-white/5 px-4 py-2.5 text-sm font-medium text-white shrink-0 cursor-pointer transition-colors hover:border-[#00b3e4]/60 select-none',
        className,
      )}
    >
      <Play size={16} weight="fill" className={enabled ? 'text-[#00C8FF]' : 'text-[#7e7e89]'} />
      <span className="whitespace-nowrap">Autoplay</span>
      <span
        aria-hidden
        className={cn(
          'relative w-10 h-5 rounded-full transition-colors shrink-0',
          enabled ? 'bg-[#00C8FF]' : 'bg-[#25252A]',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform',
            enabled ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </span>
    </div>
  )
}
