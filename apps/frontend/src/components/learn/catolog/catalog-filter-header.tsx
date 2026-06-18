'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import type { CareerTrack } from '@/components/learn/catolog/career-tracks-section'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  LEVEL_OPTIONS,
  PRICE_OPTIONS,
  TYPE_OPTIONS,
  type CatalogContentType,
  type CatalogFiltersState,
  type CatalogLevel,
  type CatalogPrice,
} from '@/lib/catalog-filter-utils'

export type CatalogQuickTab = 'all' | 'news' | 'free' | 'careers'

const QUICK_TABS: { id: CatalogQuickTab; label: string }[] = [
  { id: 'all', label: 'Tudo' },
  { id: 'news', label: 'Novidades' },
  { id: 'free', label: 'Conteúdos grátis' },
  { id: 'careers', label: 'Carreiras' },
]

const TECHNOLOGY_OPTIONS = [
  'JavaScript',
  'ReactJS',
  'Angular',
  'C#',
  'Python',
  'NodeJS',
  'VueJS',
  'React Native',
]

type CatalogFilterHeaderProps = {
  activeTab: CatalogQuickTab
  onTabChange: (tab: CatalogQuickTab) => void
  filters: CatalogFiltersState
  onFiltersChange: (filters: CatalogFiltersState) => void
  tracks: CareerTrack[]
  className?: string
}

function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((v) => v !== value)
    : [...values, value]
}

function FilterDropdown({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-white outline-none transition-colors hover:text-[#35BED5]">
        {label}
        <ChevronDown className="h-4 w-4 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[200px] border-[#25252A] bg-[#151518] text-white"
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function CatalogFilterHeader({
  activeTab,
  onTabChange,
  filters,
  onFiltersChange,
  tracks,
  className,
}: CatalogFilterHeaderProps) {
  const [technologies, setTechnologies] = React.useState<string[]>([])

  const toggleLevel = (level: CatalogLevel) => {
    onFiltersChange({
      ...filters,
      levels: toggleValue(filters.levels, level),
    })
  }

  const togglePrice = (price: CatalogPrice) => {
    onFiltersChange({
      ...filters,
      prices: toggleValue(filters.prices, price),
    })
  }

  const toggleType = (type: CatalogContentType) => {
    onFiltersChange({
      ...filters,
      types: toggleValue(filters.types, type),
    })
  }

  const toggleTechnology = (tech: string) => {
    setTechnologies((prev) => toggleValue(prev, tech))
  }

  return (
    <div
      className={cn(
        'mb-6 flex w-full min-w-0 flex-col gap-4 lg:mb-8 lg:flex-row lg:items-center lg:justify-between',
        className,
      )}
    >
      <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {QUICK_TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'shrink-0 rounded-full px-4 h-[42px] text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-gradient-500 text-[#fff]'
                  : 'bg-[#1a1a1e]/80 text-white hover:bg-[#25252A]',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="hidden shrink-0 items-center gap-5 lg:flex">
        <FilterDropdown label="Tecnologias">
          {TECHNOLOGY_OPTIONS.map((tech) => (
            <DropdownMenuCheckboxItem
              key={tech}
              checked={technologies.includes(tech)}
              onCheckedChange={() => toggleTechnology(tech)}
              className="text-white focus:bg-[#25252A] focus:text-white"
            >
              {tech}
            </DropdownMenuCheckboxItem>
          ))}
        </FilterDropdown>

        <FilterDropdown label="Níveis">
          {LEVEL_OPTIONS.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={filters.levels.includes(option.value)}
              onCheckedChange={() => toggleLevel(option.value)}
              className="text-white focus:bg-[#25252A] focus:text-white"
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </FilterDropdown>

        <FilterDropdown label="Disponibilidade">
          {PRICE_OPTIONS.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={filters.prices.includes(option.value)}
              onCheckedChange={() => togglePrice(option.value)}
              className="text-white focus:bg-[#25252A] focus:text-white"
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </FilterDropdown>

        <FilterDropdown label="Carreiras">
          {TYPE_OPTIONS.filter((o) => o.value === 'career').map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={filters.types.includes(option.value)}
              onCheckedChange={() => toggleType(option.value)}
              className="text-white focus:bg-[#25252A] focus:text-white"
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
          {tracks.map((track) => (
            <DropdownMenuCheckboxItem
              key={track.id}
              checked={filters.types.includes('career')}
              onCheckedChange={() => toggleType('career')}
              className="text-white focus:bg-[#25252A] focus:text-white"
            >
              {track.title}
            </DropdownMenuCheckboxItem>
          ))}
        </FilterDropdown>
      </div>
    </div>
  )
}
