'use client'

import { Plus } from '@phosphor-icons/react/dist/ssr'
import { useMemo, useState } from 'react'

// --- Tipagens ---
export type UserSkillTrackingItem = {
  skillId: string
  slug: string
  name: string
  xp: number
  previousXp?: number | null
}

export type SkillsTrackingCardProps = {
  skills: UserSkillTrackingItem[]
  weeklyXpGained?: number
}

const XPValue = ({ value }: { value: number }) => {
  return <span>{value.toLocaleString('pt-BR')}</span>
}

export function SkillsTrackingCard({ skills, weeklyXpGained = 0 }: SkillsTrackingCardProps) {
  const [expanded, setExpanded] = useState(false)
  const VISIBLE_COLLAPSED = 5

  const visibleSkills = useMemo(() =>
    skills.filter((s) => s.slug !== 'general'),
    [skills])

  const sortedSkills = useMemo(() => {
    return [...visibleSkills].sort((a, b) => b.xp - a.xp)
  }, [visibleSkills])

  const hasOverflow = sortedSkills.length > VISIBLE_COLLAPSED
  const displayed = useMemo(() => {
    if (expanded || !hasOverflow) return sortedSkills
    return sortedSkills.slice(0, VISIBLE_COLLAPSED)
  }, [sortedSkills, expanded, hasOverflow])

  const { axisMax, ticks } = useMemo(() => {
    const maxXp = Math.max(0, ...sortedSkills.map((s) => s.xp ?? 0))
    const rawStep = Math.max(1, maxXp / 3)
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
    const candidates = [1, 2, 5, 10].map((m) => m * magnitude)
    const step = candidates.find((c) => c >= rawStep) ?? candidates[candidates.length - 1]!
    const max = step * 3
    return {
      axisMax: max,
      ticks: [0, step, step * 2, step * 3],
    }
  }, [sortedSkills])

  const formatTick = (value: number) => {
    if (value === 0) return '0'
    if (value >= 1000) {
      const k = value / 1000
      const label = Number.isInteger(k) ? String(k) : k.toFixed(1).replace(/\.0$/, '')
      return `${label}k`
    }
    return String(value)
  }

  if (visibleSkills.length === 0) {
    return (
      <div className="rounded-[20px] border border-[#25252A] bg-[#121214] px-6 py-10 text-center">
        <p className="text-sm text-[#C4C4CC]">Ainda não há XP por skill.</p>
      </div>
    )
  }

  return (
    <div className="w-full rounded-[24px] px-0 py-6 font-sans selection:bg-[#00C8FF]/30">
      <div className="mb-8 flex flex-col gap-4">
        <h2 className="text-[20px] font-semibold tracking-tight text-white">Skills</h2>
        {weeklyXpGained > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex h-6 items-center gap-2 rounded-full bg-[#00C8FF] px-4 text-[13px] font-bold text-black">
              <Plus size={14} weight="bold" /> <XPValue value={weeklyXpGained} /> XP
            </div>
            <span className="text-sm font-medium text-[#7e7e89]">adicionado essa semana</span>
          </div>
        )}
      </div>

      <div className="mb-2 grid grid-cols-[140px_1fr_200px] items-center gap-6 px-4">
        <div />
        <div className="relative h-6">
          {ticks.map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="absolute top-0 -translate-x-1/2 text-[13px] font-medium text-[#4a4a4f]"
              style={{ left: `${(i / 3) * 100}%` }}
            >
              {formatTick(t)}
            </span>
          ))}
        </div>
        <div />
      </div>

      <div className="flex flex-col gap-1">
        {displayed.map((skill, index) => {
          const curr = skill.xp ?? 0
          const prev = skill.previousXp ?? null
          const ratio = Math.min(curr / axisMax, 1)
          const isEven = index % 2 === 0

          return (
            <div
              key={skill.skillId}
              className={`grid grid-cols-[140px_1fr_200px] items-center gap-6 px-4 py-3 transition-colors ${isEven ? 'rounded-[20px] bg-[#15151B]' : 'bg-transparent'
                }`}
            >
              <span className="truncate text-[15px] font-semibold text-[#C4C4CC]">
                {skill.name}
              </span>

              <div className="relative flex h-8 items-center">
                <div className="absolute inset-0 flex justify-between">
                  {ticks.map((t, i) => (
                    <div key={`${t}-${i}`} className="h-full w-[1px] bg-[#202024]" />
                  ))}
                </div>

                <div
                  className="relative h-[12px] min-w-[18px] rounded-full aurora-gradient"
                  style={{ width: `${ratio * 100}%` }}
                >
                  <div className="absolute inset-x-1.5 top-[2px] h-[3px] rounded-full bg-white/25" />
                  <div className="absolute inset-0 rounded-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)]" />
                </div>
              </div>

              <div className="text-right text-[14px] font-bold tabular-nums">
                {prev != null && prev !== curr ? (
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-[#7e7e89]"><XPValue value={prev} /> XP</span>
                    <span className="text-[#00C8FF] text-lg">→</span>
                    <span className="text-[#00C8FF]"><XPValue value={curr} />XP</span>
                  </div>
                ) : (
                  <span className="text-[#C4C4CC]"><XPValue value={curr} />XP</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {hasOverflow && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setExpanded(!expanded)}
            className="group flex items-center gap-2 text-[14px] font-semibold text-[#7e7e89] transition-colors hover:text-white"
          >
            {expanded ? 'Ver menos detalhes' : 'Ver mais detalhes'}
          </button>
        </div>
      )}
    </div>
  )
}