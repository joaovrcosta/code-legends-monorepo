'use client'

import { useMemo } from 'react'
import { Flame } from '@phosphor-icons/react/dist/ssr'
import type { LessonActivityDay } from '@/actions/user/get-lesson-activity'
import type { StreakResponse } from '@/actions/user/get-streak'
import { StudyMonthCalendar } from './study-month-calendar'

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
  if (!y || !m || !d) return ''
  return `${y}-${m}-${d}`
}

function addDaysUTCNoon(base: Date, days: number) {
  const d = new Date(base.getTime())
  d.setUTCHours(12, 0, 0, 0)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

function computeLastFourWeeksStats(activities: LessonActivityDay[]) {
  const todayNoon = addDaysUTCNoon(new Date(), 0)
  const fromNoon = addDaysUTCNoon(todayNoon, -27)
  const fromKey = formatYYYYMMDDInTZ(fromNoon, SAO_PAULO_TZ)
  const toKey = formatYYYYMMDDInTZ(todayNoon, SAO_PAULO_TZ)

  const activityMap = new Map<string, number>()
  for (const item of activities) {
    if (!item?.date) continue
    activityMap.set(item.date, item.count ?? 0)
  }

  let studyDays = 0
  let lessonsCompleted = 0

  for (let i = 0; i < 28; i++) {
    const key = formatYYYYMMDDInTZ(addDaysUTCNoon(fromNoon, i), SAO_PAULO_TZ)
    if (key < fromKey || key > toKey) continue
    const count = activityMap.get(key) ?? 0
    if (count > 0) {
      studyDays += 1
      lessonsCompleted += count
    }
  }

  const weeksWithStudy = Array.from({ length: 4 }, (_, weekIndex) => {
    let hasStudy = false
    for (let day = 0; day < 7; day++) {
      const offset = weekIndex * 7 + day
      const key = formatYYYYMMDDInTZ(
        addDaysUTCNoon(fromNoon, offset),
        SAO_PAULO_TZ,
      )
      if ((activityMap.get(key) ?? 0) > 0) {
        hasStudy = true
        break
      }
    }
    return hasStudy
  }).filter(Boolean).length

  return { studyDays, lessonsCompleted, weeksWithStudy }
}

interface MyLearningSidebarProps {
  activities?: LessonActivityDay[]
  streak?: StreakResponse | null
}

export function MyLearningSidebar({
  activities = [],
  streak,
}: MyLearningSidebarProps) {
  const stats = useMemo(
    () => computeLastFourWeeksStats(activities),
    [activities],
  )

  return (
    <aside className="h-fit w-full lg:sticky lg:top-6 lg:w-[420px] lg:max-w-[420px] lg:shrink-0 lg:self-start">
      <div className="space-y-4">
        <div className="rounded-[20px] border border-[#25252A] bg-surface-2 p-5">
          <StudyMonthCalendar activities={activities} />
        </div>

        <div className="rounded-[20px] border border-[#25252A] bg-surface-2 p-5">
          <h3 className="text-sm font-semibold text-white">Últimas 4 semanas</h3>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold tabular-nums text-white">
                {stats.studyDays}
              </p>
              <p className="mt-1 text-[10px] leading-tight text-[#737373]">
                dias de estudo
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-white">
                {stats.lessonsCompleted}
              </p>
              <p className="mt-1 text-[10px] leading-tight text-[#737373]">
                lições concluídas
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-white">
                {stats.weeksWithStudy}
              </p>
              <p className="mt-1 text-[10px] leading-tight text-[#737373]">
                semanas ativas
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-[#25252A] bg-surface-2 p-5">
          <div className="flex items-center gap-2">
            <Flame size={20} weight="fill" className="text-[#FF6200]" />
            <span className="text-sm font-semibold text-white">Streak</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums text-white">
              {streak?.current ?? 0}
            </span>
            <span className="text-sm text-[#737373]">
              {(streak?.current ?? 0) === 1 ? 'dia' : 'dias'}
            </span>
          </div>
          <p className="mt-2 text-xs text-[#737373]">
            Melhor sequência: {streak?.best ?? 0}{' '}
            {(streak?.best ?? 0) === 1 ? 'dia' : 'dias'}
          </p>
        </div>
      </div>
    </aside>
  )
}
