'use client'

import { useMemo, useState } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react/dist/ssr'
import type { LessonActivityDay } from '@/actions/user/get-lesson-activity'

const SAO_PAULO_TZ = 'America/Sao_Paulo'

const WEEKDAY_LABELS = ['2ª', '3ª', '4ª', '5ª', '6ª', 'sáb', 'dom'] as const

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
  if (!y || !m || !d) return ''
  return `${y}-${m}-${d}`
}

function getWeekdayMondayZero(date: Date, timeZone: string) {
  const wd = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone,
  }).format(date)
  const map: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  }
  return map[wd] ?? 0
}

function getYearMonthInTZ(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(date)
  const year = Number(parts.find((p) => p.type === 'year')?.value)
  const month = Number(parts.find((p) => p.type === 'month')?.value)
  return { year, month }
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0, 12)).getUTCDate()
}

function dateAtNoonUTC(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
}

type CalendarCell =
  | { type: 'empty' }
  | {
      type: 'day'
      day: number
      dateKey: string
      studied: boolean
      lessonCount: number
      isToday: boolean
    }

interface StudyMonthCalendarProps {
  activities?: LessonActivityDay[]
}

export function StudyMonthCalendar({ activities = [] }: StudyMonthCalendarProps) {
  const todayKey = useMemo(
    () => formatYYYYMMDDInTZ(new Date(), SAO_PAULO_TZ),
    [],
  )

  const initialView = useMemo(
    () => getYearMonthInTZ(new Date(), SAO_PAULO_TZ),
    [],
  )

  const [viewYear, setViewYear] = useState(initialView.year)
  const [viewMonth, setViewMonth] = useState(initialView.month)

  const activityMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of activities) {
      if (!item?.date) continue
      map.set(item.date, item.count ?? 0)
    }
    return map
  }, [activities])

  const monthLabel = useMemo(() => {
    const labelDate = dateAtNoonUTC(viewYear, viewMonth, 1)
    const formatted = labelDate.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
      timeZone: SAO_PAULO_TZ,
    })
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }, [viewYear, viewMonth])

  const cells = useMemo(() => {
    const totalDays = daysInMonth(viewYear, viewMonth)
    const firstWeekday = getWeekdayMondayZero(
      dateAtNoonUTC(viewYear, viewMonth, 1),
      SAO_PAULO_TZ,
    )

    const grid: CalendarCell[] = []

    for (let i = 0; i < firstWeekday; i++) {
      grid.push({ type: 'empty' })
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateKey = formatYYYYMMDDInTZ(
        dateAtNoonUTC(viewYear, viewMonth, day),
        SAO_PAULO_TZ,
      )
      const lessonCount = activityMap.get(dateKey) ?? 0
      grid.push({
        type: 'day',
        day,
        dateKey,
        studied: lessonCount > 0,
        lessonCount,
        isToday: dateKey === todayKey,
      })
    }

    return grid
  }, [viewYear, viewMonth, activityMap, todayKey])

  const goToPreviousMonth = () => {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1)
      setViewMonth(12)
      return
    }
    setViewMonth((m) => m - 1)
  }

  const goToNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1)
      setViewMonth(1)
      return
    }
    setViewMonth((m) => m + 1)
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">{monthLabel}</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#C4C4CC] transition-colors hover:bg-[#25252A] hover:text-white"
            aria-label="Mês anterior"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#C4C4CC] transition-colors hover:bg-[#25252A] hover:text-white"
            aria-label="Próximo mês"
          >
            <CaretRight size={16} weight="bold" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="pb-2 text-[11px] font-medium text-[#737373]"
          >
            {label}
          </div>
        ))}

        {cells.map((cell, index) => {
          if (cell.type === 'empty') {
            return <div key={`empty-${index}`} className="h-9" aria-hidden />
          }

          const title = cell.studied
            ? `${cell.day}: ${cell.lessonCount} ${cell.lessonCount === 1 ? 'lição' : 'lições'}`
            : `${cell.day}: sem estudo`

          return (
            <div key={cell.dateKey} className="flex h-9 items-center justify-center">
              <span
                title={title}
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm tabular-nums transition-colors',
                  cell.studied
                    ? 'bg-[#00C8FF]/15 font-semibold text-[#00C8FF] ring-1 ring-[#00C8FF]/50'
                    : 'text-[#737373]',
                  cell.isToday && !cell.studied
                    ? 'ring-1 ring-[#C4C4CC]/60 text-white'
                    : '',
                  cell.isToday && cell.studied
                    ? 'ring-2 ring-[#00C8FF]'
                    : '',
                ].join(' ')}
              >
                {cell.day}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 space-y-2 border-t border-[#25252A] pt-4 text-[11px] text-[#737373]">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-3 w-3 rounded-full bg-[#00C8FF]/15 ring-1 ring-[#00C8FF]/50" />
          <span>Dia com estudo registrado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-3 w-3 rounded-full ring-1 ring-[#C4C4CC]/60" />
          <span>Hoje</span>
        </div>
      </div>
    </div>
  )
}
