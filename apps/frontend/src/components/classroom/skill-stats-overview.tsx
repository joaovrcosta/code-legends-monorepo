'use client'

import { useEffect, useMemo, useState } from 'react'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import { getCourseSkillsProgress } from '@/actions/course'
import type { CourseSkillsProgressResponse } from '@/actions/course/skills-progress'

export function SkillStatsOverview() {
  const { activeCourse } = useActiveCourseStore()
  const { lastModuleCompletion } = useCourseModalStore()

  const [data, setData] = useState<CourseSkillsProgressResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  console.log(data)

  const xpGained = lastModuleCompletion?.xpGained ?? 0
  const moduleTitle = lastModuleCompletion?.moduleTitle

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

  const topSkills = useMemo(() => {
    if (!data?.skills?.length) return []
    return [...data.skills].sort((a, b) => b.totalXp - a.totalXp).slice(0, 2)
  }, [data])

  const maxXp = useMemo(() => {
    if (!data?.skills?.length) return 1
    return Math.max(...data.skills.map((s) => s.totalXp), 1)
  }, [data])

  if (!lastModuleCompletion?.moduleCompleted) {
    return null
  }

  return (
    <div className="rounded-2xl px-5 py-5 lg:px-6 lg:py-6 space-y-6">
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

      <div className="space-y-3">
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

        {!isLoading && skillsWithGain.length > 0 && (
          <div className="rounded-2xl border border-[#1f2933] bg-[#020617] px-4 py-4 space-y-3">
            {skillsWithGain.map((skill) => {
              const percentage = Math.round((skill.currentXp / maxXp) * 100)

              return (
                <div key={skill.skillId} className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="text-sm font-medium text-white">
                        {skill.name}
                      </span>
                      <span className="text-xs text-[#9ca3af]">
                        +{skill.gainedXp.toLocaleString('pt-BR')} XP neste
                        módulo
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#9ca3af] whitespace-nowrap">
                      <span>{skill.previousXp.toLocaleString('pt-BR')} XP</span>
                      <span className="text-[#4b5563]">→</span>
                      <span className="font-semibold text-[#facc15]">
                        {skill.currentXp.toLocaleString('pt-BR')} XP
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#020617] border border-[#111827] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#22c55e] via-[#facc15] to-[#f97316]"
                      style={{
                        width: `${Math.min(100, Math.max(10, percentage))}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
