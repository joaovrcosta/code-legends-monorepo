'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'

import { Flame } from '@phosphor-icons/react/dist/ssr'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

type StrikeSectionProps = {
  current?: number
  best?: number
  totalActiveDays?: number
}

type StreakState = {
  current: number
  best: number
  totalActiveDays: number
}

export function StrikeSection({
  current: initialCurrent,
  best: initialBest,
  totalActiveDays: initialTotalActiveDays,
}: StrikeSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session, status } = useSession()
  const [streak, setStreak] = useState<StreakState>(() => ({
    current: initialCurrent ?? 0,
    best: initialBest ?? 0,
    totalActiveDays: initialTotalActiveDays ?? 0,
  }))

  const hasInitial = useMemo(() => {
    return (
      initialCurrent != null ||
      initialBest != null ||
      initialTotalActiveDays != null
    )
  }, [initialCurrent, initialBest, initialTotalActiveDays])

  useEffect(() => {
    if (hasInitial) {
      setStreak({
        current: initialCurrent ?? 0,
        best: initialBest ?? 0,
        totalActiveDays: initialTotalActiveDays ?? 0,
      })
      return
    }

    if (status !== 'authenticated') return
    const token = (session as unknown as { accessToken?: string } | null)?.accessToken
    if (!token) return

    let cancelled = false
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
    fetch(`${baseUrl}/me/streak`, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (!r.ok) return null
        return (await r.json()) as StreakState
      })
      .then((data) => {
        if (cancelled || !data) return
        setStreak({
          current: data.current ?? 0,
          best: data.best ?? 0,
          totalActiveDays: data.totalActiveDays ?? 0,
        })
      })
      .catch(() => { })

    return () => {
      cancelled = true
    }
  }, [
    hasInitial,
    initialCurrent,
    initialBest,
    initialTotalActiveDays,
    session,
    status,
  ])

  useEffect(() => {
    let timeoutRef: NodeJS.Timeout | null = null

    const handleResize = () => {
      if (isOpen) {
        setIsOpen(false)
      }
    }

    const debouncedHandleResize = () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef)
      }
      timeoutRef = setTimeout(handleResize, 100)
    }

    window.addEventListener('resize', debouncedHandleResize)

    return () => {
      window.removeEventListener('resize', debouncedHandleResize)
      if (timeoutRef) {
        clearTimeout(timeoutRef)
      }
    }
  }, [isOpen])

  return (
    <>
      <DropdownMenu onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <div
            className={`flex items-center space-x-3 border py-2 px-3 rounded-[20px] transition-colors ${isOpen
              ? 'bg-[#25252A] border-[#FFB733]'
              : streak.current > 0
                ? 'border-[#fda736] hover:bg-[#25252A] hover:border-[#FFB733]'
                : 'border-[#25252A] hover:bg-[#25252A] hover:border-[#FFB733]'
              }`}
          >
            <Flame
              size={24}
              weight="fill"
              className={streak.current > 0 ? 'text-[#fda736]' : 'text-[#515155]'}
            />
            <span
              className={`text-base ${streak.current > 0 ? 'text-white' : 'text-[#515155]'
                }`}
            >
              {streak.current}
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="bottom"
          sideOffset={8}
          className="
          w-screen 
          max-w-none 
          left-0 
          right-0 
          rounded-none 
          border-none 
          bg-[#1A1A1E] 
          shadow-2xl 
          z-50
      
          sm:w-auto 
          sm:max-w-sm 
          sm:rounded-[20px] 
          sm:border 
          sm:border-[#25252A] 
          sm:left-auto 
          sm:right-auto
        "
        >
          <div className="p-4 text-sm w-full">
            <div className="flex items-center gap-2 mb-1">
              <p>
                <span className="font-bold bg-yellow-lightning-500 bg-clip-text text-lg text-transparent">
                  Streak
                </span>
              </p>
              <Flame size={24} weight="fill" className="text-[#cf2649]" />
            </div>
            <p className="text-sm text-[#C4C4CC]">
              Assista uma aula para aumentar seu streak
            </p>

            <div className="grid grid-cols-3 gap-3 mt-4 w-full">
              <div className="flex flex-col bg-[#25252A] items-center justify-center border border-[#25252A] rounded-[20px] p-4 min-w-0">
                <h3 className="text-2xl font-bold text-white">{streak.current}</h3>
                <p className="text-[11px] text-[#C4C4CC] text-center">
                  Streak atual
                </p>
              </div>
              <div className="flex flex-col items-center justify-center border border-[#25252A] rounded-[20px] p-4 min-w-0">
                <h3 className="text-2xl font-bold text-white">{streak.best}</h3>
                <p className="text-[11px] text-[#C4C4CC] text-center whitespace-nowrap">
                  Melhor streak
                </p>
              </div>
              <div className="flex flex-col items-center justify-center border border-[#25252A] rounded-[20px] p-4 min-w-0">
                <h3 className="text-2xl font-bold text-white">{streak.totalActiveDays}</h3>
                <p className="text-[11px] text-[#C4C4CC] text-center">
                  Total de dias
                </p>
              </div>
            </div>

            {/* Progresso Semanal */}
            <div className="mt-6 bg-[#25252A]/30 rounded-[20px] p-4">
              <div className="flex items-center justify-between mb-6">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <span className="text-xs text-[#C4C4CC] mb-2">{day}</span>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${index === 1 ? 'bg-yellow-lightning-500' : 'bg-[#25252A]'
                        }`}
                    >
                      {index === 1 && (
                        <Flame size={20} weight="fill" className="text-white" />
                      )}
                      {index === 6 && (
                        <div className="w-6 h-6 rounded-full bg-white/20" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative h-4 bg-[#25252A] rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-yellow-lightning-500 rounded-full"
                  style={{ width: '14%' }}
                />
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
