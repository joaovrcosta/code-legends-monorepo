'use client'

import { useMemo, useState } from 'react'
import type { UserSkillTrackingItem } from '@/actions/user/get-my-skills'
import { SkillModuleProgressBar } from '@/components/classroom/skill-module-progress-bar'
import { Button } from '@/components/ui/button'
import { CompactNumber } from '@/components/ui/compact-number'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  CaretDown,
  Code,
  Cpu,
  Database,
  Globe,
  Gear,
  Monitor,
} from '@phosphor-icons/react'

const VISIBLE_COLLAPSED = 8

type SortMode = 'xp_desc' | 'xp_asc' | 'name_asc'

const SORT_LABELS: Record<SortMode, string> = {
  xp_desc: 'Maior progresso',
  xp_asc: 'Menor progresso',
  name_asc: 'Nome (A–Z)',
}

function axisMaxFromValues(values: number[]): number {
  const maxXp = Math.max(0, ...values)
  if (maxXp === 0) return 100
  const withHeadroom = maxXp * 1.15
  const step =
    withHeadroom <= 100
      ? 10
      : withHeadroom <= 500
        ? 50
        : withHeadroom <= 2000
          ? 100
          : 500
  const nice = Math.ceil(withHeadroom / step) * step
  return Math.max(50, nice)
}

function skillIconFor(name: string, slug: string) {
  const n = `${name} ${slug}`.toLowerCase()
  if (
    n.includes('design') ||
    n.includes('ui') ||
    n.includes('ux') ||
    n.includes('figma')
  ) {
    return Monitor
  }
  if (
    n.includes('sql') ||
    n.includes('database') ||
    n.includes('mongo') ||
    n.includes('postgres')
  ) {
    return Database
  }
  if (
    n.includes('devops') ||
    n.includes('docker') ||
    n.includes('aws') ||
    n.includes('cloud')
  ) {
    return Gear
  }
  if (
    n.includes('html') ||
    n.includes('css') ||
    n.includes('web') ||
    n.includes('front')
  ) {
    return Globe
  }
  if (
    n.includes('python') ||
    n.includes('java') ||
    n.includes('csharp') ||
    n.includes('c#') ||
    n.includes('go ') ||
    n.includes('rust') ||
    n.includes('kotlin') ||
    n.includes('backend')
  ) {
    return Cpu
  }
  return Code
}

export type SkillsTrackingCardProps = {
  skills: UserSkillTrackingItem[]
}

export function SkillsTrackingCard({ skills }: SkillsTrackingCardProps) {
  const [sort, setSort] = useState<SortMode>('xp_desc')
  const [expanded, setExpanded] = useState(false)

  const sortedSkills = useMemo(() => {
    const copy = [...skills]
    if (sort === 'xp_desc') {
      copy.sort((a, b) => b.xp - a.xp)
    } else if (sort === 'xp_asc') {
      copy.sort((a, b) => a.xp - b.xp)
    } else {
      copy.sort((a, b) =>
        a.name.localeCompare(b.name, 'pt', { sensitivity: 'base' }),
      )
    }
    return copy
  }, [skills, sort])

  const hasOverflow = sortedSkills.length > VISIBLE_COLLAPSED
  const displayedChart = useMemo(() => {
    if (expanded || !hasOverflow) return sortedSkills
    return sortedSkills.slice(0, VISIBLE_COLLAPSED)
  }, [sortedSkills, expanded, hasOverflow])

  const displayedGrid = displayedChart

  const axisMax = useMemo(
    () => axisMaxFromValues(displayedChart.map((s) => s.xp)),
    [displayedChart],
  )

  if (skills.length === 0) {
    return (
      <div className="font-wotfard rounded-2xl border border-[#25252A] bg-surface px-5 py-10 text-center">
        <p className="text-sm text-[#C4C4CC]">
          Ainda não há XP por skill. Continue estudando para acumular XP.
        </p>
      </div>
    )
  }

  return (
    <div className="font-wotfard rounded-2xl border border-[#25252A] bg-surface px-4 py-5 sm:px-5 sm:py-6 w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-[#E8E8ED]">
          Matérias e tecnologias
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full justify-between gap-2 rounded-lg border-[#25252A] bg-transparent text-sm font-normal text-[#C4C4CC] hover:bg-[#1e1e22] hover:text-[#E8E8ED] sm:w-[200px]"
            >
              {SORT_LABELS[sort]}
              <CaretDown className="size-4 shrink-0 opacity-70" weight="bold" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[220px] border-[#25252A] bg-[#1A1A1E] text-[#E8E8ED]"
          >
            <DropdownMenuRadioGroup
              value={sort}
              onValueChange={(v) => setSort(v as SortMode)}
            >
              {(Object.keys(SORT_LABELS) as SortMode[]).map((key) => (
                <DropdownMenuRadioItem
                  key={key}
                  value={key}
                  className="focus:bg-[#25252A] focus:text-[#E8E8ED]"
                >
                  {SORT_LABELS[key]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10 xl:gap-12">
        <div className="min-w-0 w-full lg:basis-0 lg:flex-[1.45]">
          <div className="mb-2 flex">
            <div className="w-9 shrink-0 sm:w-10" />
            <div className="relative flex flex-1 justify-between text-[11px] tabular-nums text-[#71717a]">
              <span>0</span>
              <span className="absolute left-1/2 -translate-x-1/2">
                <CompactNumber value={axisMax / 2} />
              </span>
              <span>
                <CompactNumber value={axisMax} />
              </span>
            </div>
          </div>

          <div className="relative flex flex-col">
            <div className="pointer-events-none absolute bottom-0 left-9 right-0 top-0 flex sm:left-10">
              <div className="relative flex-1">
                <div className="absolute bottom-0 left-0 top-0 w-px bg-[#25252A]/50" />
                <div className="absolute bottom-0 left-1/2 top-0 w-px bg-[#25252A]/50" />
                <div className="absolute bottom-0 right-0 top-0 w-px bg-[#25252A]/50" />
              </div>
            </div>

            {displayedChart.map((skill) => {
              const Icon = skillIconFor(skill.name, skill.slug)
              const pct =
                axisMax > 0
                  ? Math.min(100, Math.max(0, (skill.xp / axisMax) * 100))
                  : 0
              const barValue = skill.xp > 0 ? Math.max(pct, 2) : 0

              return (
                <div
                  key={skill.skillId}
                  className="relative z-10 flex items-center gap-3 py-2"
                >
                  <div className="flex w-9 shrink-0 justify-center sm:w-10">
                    <Icon
                      className="text-[#C4C4CC]"
                      size={22}
                      weight="regular"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <SkillModuleProgressBar value={barValue} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:basis-0 lg:flex-1 lg:grid-cols-2">
          {displayedGrid.map((skill) => {
            const Icon = skillIconFor(skill.name, skill.slug)
            return (
              <div
                key={`grid-${skill.skillId}`}
                className="flex items-center gap-2.5 rounded-lg border border-[#25252A] bg-[#141416] px-3 py-2.5"
              >
                <div className="flex shrink-0 justify-center">
                  <Icon
                    className="text-[#C4C4CC]"
                    size={20}
                    weight="regular"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-medium text-[#E8E8ED]"
                    title={skill.name}
                  >
                    {skill.name}
                  </p>
                </div>
                <span className="shrink-0 text-sm tabular-nums text-[#C4C4CC]">
                  <CompactNumber value={skill.xp} suffix=" XP" />
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {hasOverflow ? (
        <div className="mt-6 border-t border-[#25252A]/80 pt-4">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="mx-auto flex w-full items-center justify-center gap-2 text-sm text-[#C4C4CC] transition-colors hover:text-[#00C8FF]"
          >
            {expanded ? 'Ver menos' : 'Ver todas'}
            <CaretDown
              className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
              weight="bold"
            />
          </button>
        </div>
      ) : null}
    </div>
  )
}
