'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import { getCourseSkillsProgress } from '@/actions/course'
import type { CourseSkillsProgressResponse } from '@/actions/course/skills-progress'
import { SkillModuleProgressBar } from '@/components/classroom/skill-module-progress-bar'
import { CompactNumber } from '@/components/ui/compact-number'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SkillMark } from '@/components/classroom/skill-mark'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import koji from '../../../public/koji-code-legendss.svg'

const CONFETTI_COLORS = [
  '#00C8FF',
  '#00b3ff',
  '#00a3e0',
  '#0099cc',
  '#33d4ff',
  '#66dfff',
  '#0077aa',
]

const MODULE_CELEBRATION_PHRASES = [
  'Módulo no bolso!',
  'Missão cumprida!',
  'Você avançou!',
  'Você está indo bem!',
  'Arrasou demais!',
  'Checkpoint batido!',
  'Trilha firme!',
  'XP garantido!',
  'Ritmo impecável!',
  'Mais um passo!',
  'Calculado!',
  'Smart move!',
] as const

function XpIcon({ className }: { className?: string }) {
  return (
    <img
      src="/xp-icon.svg"
      alt=""
      width={11}
      height={20}
      className={cn('shrink-0 object-contain', className)}
      aria-hidden
    />
  )
}

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

  const celebrationPhrase = useMemo(() => {
    const i = Math.floor(Math.random() * MODULE_CELEBRATION_PHRASES.length)
    return MODULE_CELEBRATION_PHRASES[i]!
  }, [
    lastModuleCompletion?.moduleCompleted,
    lastModuleCompletion?.moduleId,
  ])

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

  const studyMinutesDisplay = data?.studyMinutesInModule ?? 0

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
          {/* Hero — alinhado ao Koji + frase de celebração */}
          <div className="flex flex-col items-center space-y-6">
            <Skeleton className="h-[240px] w-[240px] rounded-[28px] shrink-0" />
            <Skeleton className="h-8 w-56 max-w-[90vw] rounded-md" />
          </div>

          <div className="flex flex-row items-center justify-center gap-4 rounded-2xl py-4 px-4">
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-2.5 w-24 rounded-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-28 rounded-md" />
                <Skeleton className="h-5 w-3 rounded-sm" />
              </div>
            </div>
          </div>

          <div className="flex justify-center px-2">
            <Skeleton className="h-4 w-72 max-w-full rounded-full" />
          </div>

          {/* Skills — mesma grelha larga + colunas w-72 / barra / w-48 */}
          <div className="w-full space-y-6 border-t border-[#1f2933]/50 pt-4">
            <div className="overflow-hidden rounded-xl py-6">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[720px]">
                  <div className="flex px-6 pr-6">
                    <div className="w-72 shrink-0" />
                    <div className="relative flex flex-1 justify-between pb-2">
                      <Skeleton className="h-4 w-6 rounded" />
                      <Skeleton className="h-4 w-10 rounded" />
                      <Skeleton className="h-4 w-10 rounded" />
                    </div>
                    <div className="w-48 shrink-0" />
                  </div>
                  <div className="mt-2 flex flex-col">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`flex items-center px-6 py-4 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
                      >
                        <div className="flex w-72 shrink-0 items-center gap-3 pr-3">
                          <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
                          <Skeleton className="h-5 flex-1 max-w-[9rem] rounded-md" />
                        </div>
                        <div className="flex flex-1 items-center py-2 pr-4">
                          <Skeleton className="h-[18px] w-full rounded-full" />
                        </div>
                        <div className="flex w-48 shrink-0 items-center justify-end gap-2">
                          <Skeleton className="h-4 w-16 rounded" />
                          <Skeleton className="h-4 w-4 rounded-sm" />
                          <Skeleton className="h-4 w-20 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="font-wotfard rounded-2xl px-5 py-5 lg:px-6 lg:py-6 space-y-8">
        <div className="space-y-6 flex items-center justify-center flex-col">
          <div
            className={`space-y-1 transition-all duration-500 ease-out ${showTitle ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}
          >
            <div className="flex items-center justify-center my-8">
              <Image src={koji} alt="Medalha" width={240} height={240} />
            </div>
            <p className="text-2xl mt-4 font-semibold text-center text-[#00C8FF] font-wotfard mb-4">
              {celebrationPhrase}
            </p>
          </div>

          <div
            className={`rounded-2xl items-center justify-center py-4 px-4 flex flex-row gap-4 transition-all duration-500 ease-out ${showStats ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}
          >

            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#7e7e89] whitespace-nowrap">Total XP</span>
              <div className="font-semibold mt-1 flex flex-row items-center gap-2 text-4xl">
                <span className="text-white bg-clip-text text-transparent whitespace-nowrap">
                  <CompactNumber value={xpTotalDisplay} enableCountUp countUpDuration={4.5} />
                </span>
                <Image src="/xp-icon.svg" alt="XP" width={11} height={20} />
              </div>
            </div>

            {/* <div className="border border-white/10 rounded-[32px] px-8 py-5 flex items-center justify-center bg-gray-gradient min-w-[180px]">
              <div className="flex flex-col items-center justify-center">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#7e7e89] whitespace-nowrap">Tempo de estudo</span>
                <div className="font-semibold italic mt-1 flex flex-row items-center justify-center text-3xl">
                  <span className="text-white bg-clip-text text-transparent">
                    <CompactNumber value={studyMinutesDisplay} enableCountUp />
                  </span>
                  <span className="text-sm text-blue-gradient-500 font-bold not-italic ml-2 self-end mb-1">MIN</span>
                </div>
              </div>
            </div> */}
          </div>

          <div
            className={`transition-all duration-500 ease-out ${showStats ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}
          >
            <p className="text-sm text-[#e5e7eb] text-center">
              Suas skills evoluíram muito nesse módulo!
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
                      const imageUrl = (
                        skill as { imageUrl?: string | null }
                      ).imageUrl

                      return (
                        <div
                          key={skill.skillId}
                          className={`flex items-center relative z-10 py-4 px-6 ${index % 2 !== 0 ? 'bg-white/[0.02]' : ''
                            }`}
                        >
                          {/* Nome da Skill */}
                          <div className="relative z-20 w-72 shrink-0 flex items-center gap-3 pr-3 bg-inherit">
                            <div className="shrink-0 p-1.5 rounded-md border border-white/10 bg-white/5 flex items-center justify-center">
                              <SkillMark
                                name={skill.name}
                                slug={skill.slug}
                                imageUrl={imageUrl}
                                size={22}
                              />
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
                            <span className="inline-flex items-center gap-1.5 text-white font-medium">
                              <XpIcon className="h-4 w-auto" />
                              <CompactNumber value={previousXp} suffix=" XP" enableCountUp />
                            </span>
                            <span className="text-white font-bold">→</span>
                            <span className="inline-flex items-center gap-1.5 font-bold">
                              <XpIcon className="h-4 w-auto" />
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
