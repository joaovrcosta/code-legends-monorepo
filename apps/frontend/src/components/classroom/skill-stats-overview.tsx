'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import { getCourseSkillsProgress } from '@/actions/course'
import type { CourseSkillsProgressResponse } from '@/actions/course/skills-progress'
import { SkillModuleProgressBar } from '@/components/classroom/skill-module-progress-bar'
import { ProgressRing } from '@/components/classroom/module-progress-ring'
import { CompactNumber } from '@/components/ui/compact-number'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Code, Monitor, TrendUp } from '@phosphor-icons/react/dist/ssr'

const CONFETTI_COLORS = [
  '#00C8FF',
  '#00b3ff',
  '#00a3e0',
  '#0099cc',
  '#33d4ff',
  '#66dfff',
  '#0077aa',
]

export function SkillStatsOverview() {
  const { activeCourse, fetchActiveCourse } = useActiveCourseStore()
  const { lastModuleCompletion } = useCourseModalStore()
  const hasFiredConfetti = useRef(false)

  const [data, setData] = useState<CourseSkillsProgressResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showTitle, setShowTitle] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showBars, setShowBars] = useState(false)
  const [barRevealIndex, setBarRevealIndex] = useState(0)

  const xpGained = lastModuleCompletion?.xpGained ?? 0
  const xpGainedInModuleBySkill = lastModuleCompletion?.xpGainedInModuleBySkill

  const hasEnrichedResponse =
    data != null &&
    data.xpGainedInModule != null &&
    data.axisMax != null &&
    Array.isArray(data.topSkills)

  const xpTotalDisplay = hasEnrichedResponse
    ? (data.xpGainedInModule ?? 0)
    : (lastModuleCompletion?.xpGainedInModule ??
      lastModuleCompletion?.xpGained ??
      0)

  const skillsWithGainFallback = useMemo(() => {
    if (!data?.skills?.length) return []

    const bySkillFromModule =
      xpGainedInModuleBySkill && xpGainedInModuleBySkill.length > 0
        ? new Map(xpGainedInModuleBySkill.map((s) => [s.skillId, s.xp]))
        : null

    return data.skills
      .map((skill) => {
        const gainedXp =
          bySkillFromModule !== null
            ? (bySkillFromModule.get(skill.skillId) ?? 0)
            : Math.round((xpGained * skill.weight) / 100)
        const currentXp = skill.totalXp
        const previousXp = Math.max(0, currentXp - gainedXp)

        return {
          ...skill,
          gainedXp,
          previousXp,
          currentXp: currentXp,
        }
      })
      .sort((a, b) => b.gainedXp - a.gainedXp)
  }, [data, xpGained, xpGainedInModuleBySkill])

  const topSkillsFallback = useMemo(() => {
    if (!data?.skills?.length) return []
    return [...data.skills].sort((a, b) => b.totalXp - a.totalXp).slice(0, 2)
  }, [data])

  const displayList = hasEnrichedResponse ? data.skills : skillsWithGainFallback

  /** XP anterior: prioriza o breakdown do último complete (store); senão usa API/histórico. */
  const skillsForDisplay = useMemo(() => {
    const storeMap =
      xpGainedInModuleBySkill && xpGainedInModuleBySkill.length > 0
        ? new Map(xpGainedInModuleBySkill.map((s) => [s.skillId, s.xp]))
        : null

    return displayList.map((skill) => {
      const totalXp = skill.totalXp
      const s = skill as {
        gainedXpInModule?: number
        gainedXp?: number
      }
      const apiGained =
        typeof s.gainedXpInModule === 'number'
          ? s.gainedXpInModule
          : typeof s.gainedXp === 'number'
            ? s.gainedXp
            : 0
      const storeXp = storeMap?.get(skill.skillId)
      const gainedInModule =
        storeXp !== undefined ? storeXp : apiGained
      const previousXp = Math.max(0, totalXp - gainedInModule)
      return {
        ...skill,
        gainedXpInModule: gainedInModule,
        previousXp,
        currentXp: totalXp,
      }
    })
  }, [displayList, xpGainedInModuleBySkill])

  const axisMaxValue = useMemo(() => {
    if (!displayList.length) return 100
    const maxXp = Math.max(
      ...displayList.map((s) => {
        const skill = s as { totalXp: number; currentXp?: number }
        return skill.currentXp ?? skill.totalXp ?? 0
      }),
      0
    )
    if (maxXp === 0) return 100
    const withHeadroom = maxXp * 1.25
    const step = withHeadroom <= 100 ? 10 : withHeadroom <= 500 ? 50 : 100
    const nice = Math.ceil(withHeadroom / step) * step
    return Math.max(50, nice)
  }, [displayList])

  const topSkillForHighlight = hasEnrichedResponse
    ? data.topSkills?.[0]
    : topSkillsFallback[0]

  const courseProgressPercent = (() => {
    const p = activeCourse?.progress ?? 0
    return Math.min(100, Math.max(0, p <= 1 ? Math.round(p * 100) : Math.round(p)))
  })()

  useEffect(() => {
    if (!lastModuleCompletion?.moduleCompleted) return
    if (hasFiredConfetti.current) return
    hasFiredConfetti.current = true

    const z = 99999
    const colors = CONFETTI_COLORS

    const runFalling = () => {
      const duration = 2_000
      const end = Date.now() + duration
      const opts = {
        particleCount: 4,
        spread: 50,
        startVelocity: 45,
        origin: { x: 0.5, y: 0 },
        colors,
        zIndex: z,
      }
      const frame = () => {
        if (Date.now() > end) return
        void confetti({ ...opts, angle: 270 })
        requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
    }

    void confetti({
      particleCount: 30,
      spread: 70,
      origin: { x: 0.5, y: 0.5 },
      colors,
      zIndex: z,
    })
    const t = setTimeout(runFalling, 200)
    return () => clearTimeout(t)
  }, [lastModuleCompletion?.moduleCompleted])

  useEffect(() => {
    if (!lastModuleCompletion?.moduleCompleted) return
    setShowTitle(false)
    setShowStats(false)
    setShowBars(false)
    setBarRevealIndex(0)

    const t1 = setTimeout(() => setShowTitle(true), 50)
    const t2 = setTimeout(() => setShowStats(true), 350)
    const t3 = setTimeout(() => setShowBars(true), 650)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [lastModuleCompletion?.moduleCompleted])

  const skillsForDisplayLength = skillsForDisplay.length
  useEffect(() => {
    if (!showBars || skillsForDisplayLength === 0) return
    if (barRevealIndex >= skillsForDisplayLength) return
    const t = setTimeout(() => setBarRevealIndex((i) => i + 1), 100)
    return () => clearTimeout(t)
  }, [showBars, barRevealIndex, skillsForDisplayLength])

  useEffect(() => {
    const load = async () => {
      if (!activeCourse?.id) return
      setIsLoading(true)
      try {
        const moduleId =
          lastModuleCompletion?.moduleCompleted &&
            lastModuleCompletion?.moduleId
            ? lastModuleCompletion.moduleId
            : undefined
        const progress = await getCourseSkillsProgress(
          activeCourse.id,
          moduleId,
        )
        setData(progress)
        await fetchActiveCourse()
      } catch (error) {
        console.error('Erro ao carregar progresso de skills do curso:', error)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [
    activeCourse?.id,
    lastModuleCompletion?.moduleCompleted,
    lastModuleCompletion?.moduleId,
    fetchActiveCourse,
  ])

  if (!lastModuleCompletion?.moduleCompleted) {
    return null
  }

  if (isLoading) {
    return (
      <TooltipProvider delayDuration={300}>
        <div className="font-wotfard rounded-2xl px-5 py-5 lg:px-6 lg:py-6 space-y-8">
          <div className="space-y-6">
            <Skeleton className="h-6 w-64" />
            <div className="flex items-center gap-4 py-4">
              <Skeleton className="h-16 w-16 rounded-full shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-4 w-3/4 max-w-sm" />
            </div>
          </div>
          <div className="space-y-6 w-full pt-4 border-t border-[#1f2933]/50">
            <div className="rounded-xl py-6 px-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-5 w-40 shrink-0" />
                  <Skeleton className="h-[18px] flex-1 rounded-full" />
                  <Skeleton className="h-5 w-24 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="font-wotfard rounded-2xl px-5 py-5 lg:px-6 lg:py-6 space-y-8">
        <div className="space-y-6">
          <div
            className={`space-y-1 transition-all duration-500 ease-out ${showTitle ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}
          >
            <p className="text-xl font-semibold uppercase tracking-[0.18em] text-[#00c8ff] mb-4">
              Módulo concluído!🎉
            </p>
            <p className="text-sm text-[#e5e7eb]">
              Curso <span className="font-semibold text-[#00c8ff]">{courseProgressPercent}%</span> completo
            </p>
          </div>

          <div
            className={`rounded-2xl py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between transition-all duration-500 ease-out ${showStats ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-sm">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#7e7e89]">Total Ganhos</span>
                <span className="font-semibold w-full italic mt-1 bg-[linear-gradient(90deg,#ef4444_0%,#f97316_50%,#eab308_100%)] bg-clip-text text-transparent gap-2 text-2xl">
                  +<CompactNumber value={xpTotalDisplay} enableCountUp />
                  <span className="text-sm text-orange-500 font-bold">XP</span>
                </span>
              </div>
              <div className="w-[1px] h-10 bg-white/10" />
              <TrendUp size={32} className="text-orange-500" weight="bold" />
            </div>
          </div>

          <div
            className={`transition-all duration-500 ease-out ${showStats ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}
          >
            <p className="text-sm text-[#e5e7eb]">
              Seus skills evoluíram nesse módulo!
            </p>
          </div>
        </div>

        <div
          className={`space-y-6 w-full pt-4 border-t border-[#1f2933]/50 transition-all duration-500 ease-out ${showBars ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
        >
          <div className="rounded-xl py-6 overflow-hidden">
            {skillsForDisplay.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <div className="min-w-[720px]">
                  {/* Eixo X — mesma largura da coluna de skills que as linhas (w-72) */}
                  <div className="flex pr-6 pl-6">
                    <div className="w-72 shrink-0" />
                    <div className="flex-1 flex justify-between text-sm font-medium text-[#9ca3af] pb-2 relative">
                      <span className="-translate-x-1/2 absolute left-0">
                        0
                      </span>
                      <span className="-translate-x-1/2 absolute left-1/2">
                        <CompactNumber value={axisMaxValue / 2} enableCountUp />
                      </span>
                      <span className="absolute right-0 translate-x-1/2">
                        <CompactNumber value={axisMaxValue} enableCountUp />
                      </span>
                    </div>
                    <div className="w-48 shrink-0" />
                  </div>

                  {/* Grade e Barras */}
                  <div className="relative flex flex-col mt-2">
                    <div className="absolute inset-y-0 right-6 left-6 flex pointer-events-none">
                      <div className="w-72 shrink-0" />
                      <div className="flex-1 flex justify-between relative">
                        <div className="w-px h-full bg-[#1f2937] absolute left-0" />
                        <div className="w-px h-full bg-[#1f2937] absolute left-1/2" />
                        <div className="w-px h-full bg-[#1f2937] absolute right-0" />
                      </div>
                      <div className="w-48 shrink-0" />
                    </div>

                    {skillsForDisplay.map((skill, index) => {
                      const currentXp = skill.currentXp ?? skill.totalXp
                      const previousXp = skill.previousXp ?? 0
                      const percentage = Math.max(
                        2,
                        Math.min(100, (currentXp / axisMaxValue) * 100),
                      )
                      // Define o ícone com base no nome da skill para exemplificar
                      const isWebDesign = skill.name
                        .toLowerCase()
                        .includes('design')

                      return (
                        <div
                          key={skill.skillId}
                          className={`flex items-center relative z-10 py-4 px-6 ${index % 2 !== 0 ? 'bg-white/[0.02]' : ''
                            }`}
                        >
                          {/* Nome da Skill */}
                          <div className="relative z-20 w-72 shrink-0 flex items-center gap-3 pr-3 bg-inherit">
                            <div className="shrink-0 p-1.5 rounded-md border border-white/10 bg-white/5">
                              {isWebDesign ? <Monitor /> : <Code />}
                            </div>
                            <span
                              className="min-w-0 text-white font-normal text-[18px] truncate"
                              title={skill.name}
                            >
                              {skill.name}
                            </span>
                          </div>

                          {/* Barra: enche em sequência após a seção aparecer */}
                          <div className="flex-1 py-2 pr-4 relative flex items-center">
                            <SkillModuleProgressBar
                              value={barRevealIndex > index ? percentage : 0}
                              flameGradient
                            />
                          </div>

                          {/* Pontuação */}
                          <div className="w-48 shrink-0 flex justify-end items-center gap-3 text-[15px]">
                            <span className="text-white font-medium">
                              <CompactNumber value={previousXp} suffix=" XP" enableCountUp />
                            </span>
                            <span className="text-white font-bold">→</span>
                            <span className="font-bold">
                              <CompactNumber value={currentXp} suffix=" XP" enableCountUp flameGradient />
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-6 text-[#9ca3af]">
                Nenhuma skill evoluída neste módulo.
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
