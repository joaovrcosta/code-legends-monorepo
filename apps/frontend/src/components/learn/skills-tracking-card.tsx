'use client'

import { useMemo, useState } from 'react'
import { Lightning, Plus } from '@phosphor-icons/react/dist/ssr'

// --- Tipagens ---
export type UserSkillTrackingItem = {
  skillId: string
  slug: string
  name: string
  xp: number
  previousXp?: number | null
  xpGainedThisWeek?: number
}

export type SkillsTrackingCardProps = {
  skills: UserSkillTrackingItem[]
  weeklyXpGained?: number
  plan?: string | null
}

const XPValue = ({ value }: { value: number }) => {
  return <span>{value.toLocaleString('pt-BR')}</span>
}

function planToLightningClass(plan?: string | null) {
  if (plan === 'PREMIUM') return 'text-[#00FFA3]'
  if (plan === 'PRO') return 'text-[#00C8FF]'
  return 'text-[#7e7e89]'
}

function hasWeeklyGain(skill: UserSkillTrackingItem) {
  const gained = skill.xpGainedThisWeek ?? 0
  if (gained > 0) return true
  const prev = skill.previousXp
  const curr = skill.xp ?? 0
  return prev != null && prev !== curr
}

function getSkillBarSegments(skill: UserSkillTrackingItem, axisMax: number) {
  const curr = skill.xp ?? 0
  const gained = skill.xpGainedThisWeek ?? 0
  const prev =
    skill.previousXp != null
      ? skill.previousXp
      : gained > 0
        ? Math.max(0, curr - gained)
        : curr

  const safeMax = axisMax > 0 ? axisMax : 1
  const currRatio = curr > 0 ? Math.min(curr / safeMax, 1) : 0
  const hasPrevious = prev > 0
  const hasGain = gained > 0

  const innerPrevShare = curr > 0 ? prev / curr : 0
  const innerGainShare = curr > 0 ? gained / curr : 0

  return {
    curr,
    prev,
    gained,
    currRatio,
    hasPrevious,
    hasGain,
    innerPrevShare,
    innerGainShare,
  }
}

function SkillXpProgressBar({
  skill,
  axisMax,
  heightClass = 'h-3',
}: {
  skill: UserSkillTrackingItem
  axisMax: number
  heightClass?: string
}) {
  const {
    curr,
    currRatio,
    hasPrevious,
    hasGain,
    innerPrevShare,
    innerGainShare,
  } = getSkillBarSegments(skill, axisMax)

  if (curr <= 0 || currRatio <= 0) {
    return (
      <div className={`relative w-full overflow-hidden rounded-full bg-[#25252A] ${heightClass}`} />
    )
  }

  const onlyGain = hasGain && !hasPrevious
  const basePlusGain = hasGain && hasPrevious
  /** Sobreposição do ganho sob a ponta arredondada do XP anterior (≈ raio da barra h-3). */
  const gainUnderlapPx = 6

  return (
    <div className={`relative w-full overflow-hidden rounded-full bg-[#25252A] ${heightClass}`}>
      {basePlusGain ? (
        <div
          className={`relative ${heightClass}`}
          style={{ width: `${currRatio * 100}%` }}
        >
          <div
            className="skill-xp-base-fill absolute inset-y-0 left-0 z-10 rounded-full"
            style={{ width: `${innerPrevShare * 100}%` }}
          />
          <div
            className="bg-cyan-500/30 absolute inset-y-0 z-0 rounded-full"
            style={{
              left: `calc(${innerPrevShare * 100}% - ${gainUnderlapPx}px)`,
              width: `calc(${innerGainShare * 100}% + ${gainUnderlapPx}px)`,
            }}
          />
        </div>
      ) : (
        <div
          className={`flex h-full min-w-0 ${heightClass}`}
          style={{ width: `${currRatio * 100}%` }}
        >
          {hasGain ? (
            <div className="bg-cyan-500/30 h-full w-full min-w-0 shrink-0 rounded-full" />
          ) : (
            <div className="aurora-gradient h-full w-full min-w-0 rounded-full" />
          )}
        </div>
      )}
    </div>
  )
}

function getDisplayPreviousXp(skill: UserSkillTrackingItem) {
  const curr = skill.xp ?? 0
  const gained = skill.xpGainedThisWeek ?? 0
  if (skill.previousXp != null) return skill.previousXp
  if (gained > 0) return Math.max(0, curr - gained)
  return curr
}

export function SkillsTrackingCard({
  skills,
  weeklyXpGained = 0,
  plan,
}: SkillsTrackingCardProps) {
  const [expanded, setExpanded] = useState(false)
  const VISIBLE_COLLAPSED = 5

  const visibleSkills = useMemo(
    () => skills.filter((s) => s.slug !== 'general'),
    [skills],
  )

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

  const showPlanBolt = ['PRO', 'PREMIUM'].includes(String(plan ?? ''))

  if (visibleSkills.length === 0) {
    return (
      <div className="rounded-[20px] bg-transparent px-6 py-10 text-center">
        <p className="text-sm text-[#C4C4CC]">Ainda não há XP por skill.</p>
      </div>
    )
  }

  return (
    <div className="w-full rounded-[24px] px-0 py-6 font-sans selection:bg-[#00C8FF]/30 md:px-0">
      <div className="mb-6 flex flex-col gap-4 md:mb-8">
        <h2 className="text-[20px] font-semibold tracking-tight text-white">Skills</h2>
        {weeklyXpGained > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-full bg-streak-flame px-2 text-[12px] font-bold text-black">
              <Plus size={14} weight="bold" /> <XPValue value={weeklyXpGained} /> XP
            </div>
            <span className="text-sm font-medium text-[#7e7e89]">adicionado essa semana</span>
          </div>
        )}
      </div>

      {/* Mobile: cards em coluna (layout do mock) */}
      <div className="flex flex-col gap-3 md:hidden">
        {displayed.map((skill) => {
          const curr = skill.xp ?? 0
          const prev = getDisplayPreviousXp(skill)
          const showComparison = hasWeeklyGain(skill)

          return (
            <div
              key={skill.skillId}
              className="rounded-[20px] bg-[#15151B] px-4 py-3.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex min-w-0 max-w-[38%] shrink-0 items-center gap-1.5">
                  {showPlanBolt && (
                    <Lightning
                      size={16}
                      weight="fill"
                      className={`shrink-0 ${planToLightningClass(plan)}`}
                    />
                  )}
                  <span className="truncate text-[15px] font-semibold text-white">
                    {skill.name}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <SkillXpProgressBar skill={skill} axisMax={axisMax} heightClass="h-2.5" />
                </div>

                <div className="max-w-[42%] shrink-0 text-right text-[12px] font-bold leading-tight tabular-nums sm:text-[13px]">
                  {showComparison ? (
                    <span className="inline-flex flex-wrap items-center justify-end gap-x-1 gap-y-0.5">
                      <span className="text-[#C4C4CC]">
                        <XPValue value={prev} /> XP
                      </span>
                      <span className="text-[#00C8FF]">→</span>
                      <span className="text-[#00C8FF]">
                        <XPValue value={curr} />XP
                      </span>
                    </span>
                  ) : (
                    <span className="text-[#C4C4CC]">
                      <XPValue value={curr} />XP
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop: gráfico com eixo e grade */}
      <div className="hidden md:block">
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
            const prev = getDisplayPreviousXp(skill)
            const showComparison = hasWeeklyGain(skill)
            const isEven = index % 2 === 0

            return (
              <div
                key={skill.skillId}
                className={`grid grid-cols-[140px_1fr_200px] items-center gap-6 px-4 py-3 transition-colors ${isEven ? 'rounded-[20px] bg-[#15151B]' : 'bg-transparent'
                  }`}
              >
                <span className="flex min-w-0 items-center gap-2 truncate text-[15px] font-semibold text-[#C4C4CC]">
                  {showPlanBolt && (
                    <Lightning
                      size={16}
                      weight="fill"
                      className={`shrink-0 ${planToLightningClass(plan)}`}
                    />
                  )}
                  <span className="truncate">{skill.name}</span>
                </span>

                <div className="relative flex h-8 w-full items-center">
                  <div className="absolute inset-0 flex justify-between">
                    {ticks.map((t, i) => (
                      <div key={`${t}-${i}`} className="h-full w-px bg-[#202024]" />
                    ))}
                  </div>

                  <div className="relative z-10 w-full">
                    <SkillXpProgressBar skill={skill} axisMax={axisMax} />
                  </div>
                </div>

                <div className="text-right text-[14px] font-bold tabular-nums">
                  {showComparison ? (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[#7e7e89]">
                        <XPValue value={prev} /> XP
                      </span>
                      <span className="text-lg text-[#00C8FF]">→</span>
                      <span className="text-[#00C8FF]">
                        <XPValue value={curr} />XP
                      </span>
                    </div>
                  ) : (
                    <span className="text-[#C4C4CC]">
                      <XPValue value={curr} />XP
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {hasOverflow && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
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
