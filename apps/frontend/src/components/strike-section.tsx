'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'

import { Lightning } from '@phosphor-icons/react/dist/ssr'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const SAO_PAULO_TZ = 'America/Sao_Paulo'

function formatYYYYMMDDInTZ(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const y = parts.find((p) => p.type === 'year')?.value
  const m = parts.find((p) => p.type === 'month')?.value
  const d = parts.find((p) => p.type === 'day')?.value
  if (!y || !m || !d) return null
  return `${y}-${m}-${d}`
}

function addDaysUTCNoon(base: Date, days: number) {
  const d = new Date(base.getTime())
  d.setUTCHours(12, 0, 0, 0)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

function weekdayIdxInTZ(date: Date, timeZone: string) {
  const wd = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
  })
    .formatToParts(date)
    .find((p) => p.type === 'weekday')?.value

  const toIdx: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }

  return wd != null ? toIdx[wd] : undefined
}

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

type LessonActivityDay = {
  date: string
  count: number
}

type LessonActivityResponse = {
  days: LessonActivityDay[]
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
  const [weekly, setWeekly] = useState<LessonActivityDay[]>([])

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
    Promise.all([
      fetch(`${baseUrl}/me/streak`, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` },
      }).then(async (r) => (r.ok ? ((await r.json()) as StreakState) : null)),
      fetch(`${baseUrl}/me/activity/lessons?days=7`, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` },
      }).then(async (r) =>
        r.ok ? ((await r.json()) as LessonActivityResponse) : null,
      ),
    ])
      .then(([streakData, activityData]) => {
        if (cancelled) return
        if (streakData) {
          setStreak({
            current: streakData.current ?? 0,
            best: streakData.best ?? 0,
            totalActiveDays: streakData.totalActiveDays ?? 0,
          })
        }
        if ((streakData?.current ?? 0) === 0) {
          setWeekly([])
          return
        }
        if (activityData?.days) {
          setWeekly(activityData.days)
        }
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
    const handler = (evt: Event) => {
      const custom = evt as CustomEvent<{
        current: number
        best: number
        totalActiveDays: number
      }>
      if (!custom?.detail) return

      setStreak({
        current: custom.detail.current ?? 0,
        best: custom.detail.best ?? 0,
        totalActiveDays: custom.detail.totalActiveDays ?? 0,
      })

      if ((custom.detail.current ?? 0) === 0) {
        setWeekly([])
        return
      }

      // Otimização: marca o dia de hoje como ativo sem precisar refetch.
      const todayKey = formatYYYYMMDDInTZ(new Date(), SAO_PAULO_TZ)
      if (!todayKey) return
      setWeekly((prev) => {
        const next = [...prev]
        const idx = next.findIndex((d) => d.date === todayKey)
        if (idx !== -1) {
          const prevCount = next[idx].count ?? 0
          next[idx] = { ...next[idx], count: Math.max(1, prevCount) }
          return next
        }
        return [...next, { date: todayKey, count: 1 }]
      })
    }

    window.addEventListener('cl-streak-updated', handler)
    return () => window.removeEventListener('cl-streak-updated', handler)
  }, [])

  const weeklyView = useMemo(() => {
    const map = new Map(weekly.map((d) => [d.date, d.count]))

    const todayKey = formatYYYYMMDDInTZ(new Date(), SAO_PAULO_TZ)
    const todayNoonUTC = addDaysUTCNoon(new Date(), 0)
    const todayWIdx = weekdayIdxInTZ(todayNoonUTC, SAO_PAULO_TZ) ?? 0

    // Semana atual (Dom..Sáb) no fuso SP
    const startOfWeekNoonUTC = addDaysUTCNoon(todayNoonUTC, -todayWIdx)
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = addDaysUTCNoon(startOfWeekNoonUTC, i)
      const key = formatYYYYMMDDInTZ(date, SAO_PAULO_TZ) ?? ''
      return { date: key, count: map.get(key) ?? 0 }
    })

    const activeDays = days.reduce((acc, d) => acc + (d.count > 0 ? 1 : 0), 0)
    const percent = Math.round((activeDays / 7) * 100)
    return { days, todayKey, percent }
  }, [weekly])

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
              ? 'bg-[#25252A] border-lime-400/80'
              : streak.current > 0
                ? 'border-[#25252A] hover:bg-[#25252A] hover:border-lime-400/70'
                : 'border-[#25252A] hover:bg-[#25252A] hover:border-lime-400/70'
              }`}
          >
            <Lightning
              size={24}
              weight="fill"
              className={streak.current > 0 ? 'text-lime-400 drop-shadow-[0_0_10px_rgba(163,230,53,0.45)]' : 'text-[#515155]'}
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
          bg-surface-2 
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
                <span className="font-bold bg-lime-streak bg-clip-text text-lg text-transparent">
                  Streak
                </span>
              </p>
              <Lightning
                size={24}
                weight="fill"
                className="text-lime-300 drop-shadow-[0_0_12px_rgba(163,230,53,0.5)]"
              />
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

            <div className="mt-6 bg-[#25252A]/30 rounded-[20px] p-4">
              <div className="flex items-center justify-between mb-6">
                {(['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] as const).map((label, idx) => {
                  const day = weeklyView.days[idx]
                  const isToday =
                    weeklyView.todayKey != null && day.date === weeklyView.todayKey
                  const isActive = day.count > 0
                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <span className="text-xs text-[#C4C4CC] mb-2">{label}</span>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-lime-streak' : 'bg-[#25252A]'
                          }`}
                        title={
                          day.date
                            ? `${day.date}: ${day.count} ${day.count === 1 ? 'aula' : 'aulas'}`
                            : undefined
                        }
                      >
                        {isActive ? (
                          <Lightning
                            size={20}
                            weight="fill"
                            className="text-[#0f1408] drop-shadow-[0_0_6px_rgba(190,242,100,0.65)]"
                          />
                        ) : isToday ? (
                          <div className="w-6 h-6 rounded-full bg-white/20" />
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="relative h-4 bg-[#25252A] rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-lime-streak-bar rounded-full"
                  style={{ width: `${weeklyView.percent}%` }}
                />
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
