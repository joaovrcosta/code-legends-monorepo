'use client'

import { useMemo, useState } from 'react'
import type { UserSkillTrackingItem } from '@/actions/user/get-my-skills'
import { SkillMark } from '@/components/classroom/skill-mark'
import { CompactNumber } from '@/components/ui/compact-number'
import Image from 'next/image'

const VISIBLE_COLLAPSED = 3

export type SkillsTrackingCardProps = {
  skills: UserSkillTrackingItem[]
}

export function SkillsTrackingCard({ skills }: SkillsTrackingCardProps) {
  const [expanded, setExpanded] = useState(false)

  const visibleSkills = useMemo(() => skills.filter((s) => s.slug !== 'general'), [skills])

  const sortedSkills = useMemo(() => {
    return [...visibleSkills].sort((a, b) => b.xp - a.xp)
  }, [visibleSkills])

  const hasOverflow = sortedSkills.length > VISIBLE_COLLAPSED
  const displayed = useMemo(() => {
    if (expanded || !hasOverflow) return sortedSkills
    return sortedSkills.slice(0, VISIBLE_COLLAPSED)
  }, [sortedSkills, expanded, hasOverflow])

  if (visibleSkills.length === 0) {
    return (
      <div className="rounded-[20px] border border-[#25252A] bg-[#1A1A1E] px-6 py-10 text-center">
        <p className="text-sm text-[#C4C4CC]">Ainda não há XP por skill.</p>
        <p className="mt-1 text-xs text-[#7e7e89]">
          Continue estudando para acumular XP e ver suas skills aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[20px] border border-[#25252A] bg-gray-gradient p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-white">Principais skills</h2>
      </div>

      <div className="mt-4 space-y-3">
        {displayed.map((skill) => (
          <div
            key={skill.skillId}
            className="flex items-center justify-between gap-4 rounded-full border border-[#25252A] bg-[#141417] px-4 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-[#25252A]">
                <SkillMark
                  name={skill.name}
                  slug={skill.slug}
                  imageUrl={skill.imageUrl}
                  size={20}
                />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {skill.name}
                </p>
                <div className="mt-1 inline-flex items-center rounded-full border border-[#25252A] bg-transparent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#C4C4CC]">
                  skill
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <span className="inline-flex items-center gap-2 text-base font-semibold text-[#FF6200] tabular-nums">
                <Image src="/xp-icon.svg" alt="XP" width={11} height={20} />
                <CompactNumber value={skill.xp} suffix="XP" flameGradient enableCountUp />
              </span>
            </div>
          </div>
        ))}
      </div>

      {hasOverflow && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="h-10 rounded-full border border-[#25252A] bg-transparent px-6 text-xs font-medium text-white transition-colors hover:bg-[#25252A]"
          >
            {expanded ? 'Mostrar menos' : 'Mostrar mais'}
          </button>
        </div>
      )}
    </div>
  )
}