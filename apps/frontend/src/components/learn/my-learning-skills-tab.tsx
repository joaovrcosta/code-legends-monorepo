'use client'

import { useMemo } from 'react'
import type { UserSkillTrackingItem } from '@/actions/user/get-my-skills'

interface MyLearningSkillsTabProps {
  skills: UserSkillTrackingItem[]
}

export function MyLearningSkillsTab({ skills }: MyLearningSkillsTabProps) {
  const progressedSkills = useMemo(
    () =>
      skills
        .filter((skill) => skill.slug !== 'general' && (skill.xp ?? 0) > 0)
        .sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0)),
    [skills],
  )

  if (progressedSkills.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted">
          Ainda não há habilidades evoluídas.
        </p>
        <p className="mt-2 max-w-sm text-xs text-[#737373]">
          Complete lições e desafios para ganhar XP nas skills dos cursos.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <h2 className="text-base font-semibold text-white">
        Habilidades nas quais você progrediu
      </h2>

      <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {progressedSkills.map((skill) => (
          <li
            key={skill.skillId}
            className="flex items-center justify-between gap-4 rounded-[16px] border border-[#25252A] bg-primary px-4 py-4"
          >
            <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-white">
              {skill.name}
            </span>
            <span className="shrink-0 text-sm tabular-nums text-[#737373]">
              {(skill.xp ?? 0).toLocaleString('pt-BR')} XP
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
