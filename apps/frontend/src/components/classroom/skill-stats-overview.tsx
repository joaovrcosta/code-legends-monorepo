'use client'

import { useEffect, useMemo, useState } from 'react'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import { getCourseSkillsProgress } from '@/actions/course'
import type { CourseSkillsProgressResponse } from '@/actions/course/skills-progress'
import { SkillModuleProgressBar } from '@/components/classroom/skill-module-progress-bar'

// Ícones SVG para as skills
const CodeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-[#9ca3af]"
  >
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
)
const MonitorIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-[#9ca3af]"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
  </svg>
)

export function SkillStatsOverview() {
  const { activeCourse } = useActiveCourseStore()
  const { lastModuleCompletion } = useCourseModalStore()

  const [data, setData] = useState<CourseSkillsProgressResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const xpGained = lastModuleCompletion?.xpGained ?? 0
  const moduleTitle = lastModuleCompletion?.moduleTitle

  // Cálculos para o gráfico e evolução
  const skillsWithGain = useMemo(() => {
    if (!data?.skills?.length) return []

    return data.skills
      .map((skill) => {
        const gainedXp = Math.round((xpGained * skill.weight) / 100)
        const currentXp = skill.totalXp
        const previousXp = Math.max(0, currentXp - gainedXp)

        return {
          ...skill,
          gainedXp,
          previousXp,
          currentXp,
        }
      })
      .sort((a, b) => b.gainedXp - a.gainedXp)
  }, [data, xpGained])

  // Lógica de escala dinâmica para o Eixo X do gráfico (múltiplos de 1500)
  const axisMax = useMemo(() => {
    if (!skillsWithGain.length) return 3000
    const max = Math.max(...skillsWithGain.map((s) => s.currentXp))
    const step = 1500
    return Math.max(3000, Math.ceil(max / step) * step)
  }, [skillsWithGain])

  // Cálculos originais para o card superior
  const topSkills = useMemo(() => {
    if (!data?.skills?.length) return []
    return [...data.skills].sort((a, b) => b.totalXp - a.totalXp).slice(0, 2)
  }, [data])

  const maxXp = useMemo(() => {
    if (!data?.skills?.length) return 1
    return Math.max(...data.skills.map((s) => s.totalXp), 1)
  }, [data])

  useEffect(() => {
    const load = async () => {
      if (!activeCourse?.id) return
      setIsLoading(true)
      try {
        const progress = await getCourseSkillsProgress(activeCourse.id)
        setData(progress)
      } catch (error) {
        console.error('Erro ao carregar progresso de skills do curso:', error)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [activeCourse?.id])

  if (!lastModuleCompletion?.moduleCompleted) {
    return null
  }

  return (
    <div className="rounded-2xl px-5 py-5 lg:px-6 lg:py-6 space-y-8">
      {/* 1. SEÇÃO ORIGINAL SUPERIOR */}
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9ca3af]">
            Módulo concluído
          </p>
          <h2 className="text-xl lg:text-2xl font-semibold text-white">
            {moduleTitle || 'Você concluiu este módulo!'}
          </h2>
        </div>

        <div className="rounded-2xl border border-[#1f2933] bg-[#020617] px-4 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9ca3af]">
              O que você está desenvolvendo
            </p>
            <p className="text-sm text-[#e5e7eb] max-w-md">
              Este módulo ajudou você a evoluir nas principais skills técnicas
              deste curso.
            </p>
          </div>

          {topSkills[0] && (
            <div className="flex items-center gap-4 self-start md:self-auto">
              <div className="relative h-16 w-16 rounded-full bg-[#020617] border border-[#1f2933] flex items-center justify-center">
                <div className="absolute inset-1 rounded-full bg-[#020617]" />
                <div className="relative flex items-center justify-center h-full w-full">
                  <span className="text-lg font-semibold text-[#facc15]">
                    {Math.min(
                      99,
                      Math.max(
                        10,
                        Math.round((topSkills[0].totalXp / maxXp) * 100),
                      ),
                    )}
                    %
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#9ca3af]">
                  Skill em destaque
                </span>
                <p className="text-sm font-medium text-white">
                  {topSkills[0].name}
                </p>
                <p className="text-xs text-[#9ca3af]">
                  {topSkills[0].totalXp.toLocaleString('pt-BR')} XP totais
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-sm text-[#e5e7eb]">
          {xpGained > 0 ? (
            <>
              Você ganhou{' '}
              <span className="font-semibold text-[#facc15]">
                +{xpGained.toLocaleString('pt-BR')} XP
              </span>{' '}
              distribuídos entre as skills abaixo neste módulo.
            </>
          ) : (
            'Você não ganhou XP em skills neste módulo.'
          )}
        </p>
      </div>

      <div className="space-y-6 w-full pt-4 border-t border-[#1f2933]/50">
        <div className="rounded-xl py-6 overflow-hidden">
          {isLoading ? (
            <div className="px-6 text-[#9ca3af]">Carregando gráfico...</div>
          ) : skillsWithGain.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <div className="min-w-[650px]">
                {/* Eixo X */}
                <div className="flex pr-6 pl-6">
                  <div className="w-56 shrink-0" />
                  <div className="flex-1 flex justify-between text-sm font-medium text-[#9ca3af] pb-2 relative">
                    <span className="-translate-x-1/2 absolute left-0">0</span>
                    <span className="-translate-x-1/2 absolute left-1/2">
                      {(axisMax / 2).toLocaleString('en-US')}
                    </span>
                    <span className="absolute right-0 translate-x-1/2">
                      {axisMax.toLocaleString('en-US')}
                    </span>
                  </div>
                  <div className="w-48 shrink-0" />
                </div>

                {/* Grade e Barras */}
                <div className="relative flex flex-col mt-2">
                  <div className="absolute inset-y-0 right-6 left-6 flex pointer-events-none">
                    <div className="w-56 shrink-0" />
                    <div className="flex-1 flex justify-between relative">
                      <div className="w-px h-full bg-[#1f2937] absolute left-0" />
                      <div className="w-px h-full bg-[#1f2937] absolute left-1/2" />
                      <div className="w-px h-full bg-[#1f2937] absolute right-0" />
                    </div>
                    <div className="w-48 shrink-0" />
                  </div>

                  {skillsWithGain.map((skill, index) => {
                    const percentage = Math.max(
                      2,
                      Math.min(100, (skill.currentXp / axisMax) * 100),
                    )
                    // Define o ícone com base no nome da skill para exemplificar
                    const isWebDesign = skill.name
                      .toLowerCase()
                      .includes('design')

                    return (
                      <div
                        key={skill.skillId}
                        className={`flex items-center relative z-10 py-4 px-6 ${
                          index % 2 !== 0 ? 'bg-white/[0.02]' : ''
                        }`}
                      >
                        {/* Nome da Skill */}
                        <div className="w-56 shrink-0 flex items-center gap-3">
                          <div className="p-1.5 rounded-md border border-white/10 bg-white/5">
                            {isWebDesign ? <MonitorIcon /> : <CodeIcon />}
                          </div>
                          <span className="text-white font-semibold text-sm">
                            {skill.name}
                          </span>
                        </div>

                        {/* Barra */}
                        <div className="flex-1 py-2 pr-4 relative flex items-center">
                          <SkillModuleProgressBar value={percentage} />
                        </div>

                        {/* Pontuação */}
                        <div className="w-48 shrink-0 flex justify-end items-center gap-3 text-[15px]">
                          <span className="text-white font-medium">
                            {skill.previousXp.toLocaleString('en-US')} XP
                          </span>
                          <span className="text-white font-bold">→</span>
                          <span className="text-[#facc15] font-bold">
                            {skill.currentXp.toLocaleString('en-US')} XP
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
  )
}
