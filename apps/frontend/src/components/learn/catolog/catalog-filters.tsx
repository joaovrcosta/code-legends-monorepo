'use client'

import Link from 'next/link'
import { ListFilter } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import {
  DEFAULT_CATALOG_FILTERS,
  DURATION_OPTIONS,
  LEVEL_OPTIONS,
  PRICE_OPTIONS,
  TYPE_OPTIONS,
  type CatalogContentType,
  type CatalogDuration,
  type CatalogFiltersState,
  type CatalogLevel,
  type CatalogPrice,
} from '@/lib/catalog-filter-utils'

type CatalogFiltersProps = {
  filters: CatalogFiltersState
  onChange: (filters: CatalogFiltersState) => void
  className?: string
  showHeader?: boolean
}

function FilterSection({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="border-b border-[#25252A] py-5 first:pt-0 last:border-b-0">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((v) => v !== value)
    : [...values, value]
}

export function CatalogFilters({
  filters,
  onChange,
  className,
  showHeader = true,
}: CatalogFiltersProps) {
  const handleClear = () => onChange(DEFAULT_CATALOG_FILTERS)

  const toggleLevel = (level: CatalogLevel) => {
    onChange({ ...filters, levels: toggleValue(filters.levels, level) })
  }

  const togglePrice = (price: CatalogPrice) => {
    onChange({ ...filters, prices: toggleValue(filters.prices, price) })
  }

  const toggleType = (type: CatalogContentType) => {
    onChange({ ...filters, types: toggleValue(filters.types, type) })
  }

  const setDuration = (duration: CatalogDuration) => {
    onChange({ ...filters, duration })
  }

  return (
    <aside
      className={cn(
        'w-full rounded-xl py-5 px-0',
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        {showHeader ? (
          <>
            <div className="flex items-center gap-2">
              <ListFilter className="h-5 w-5 text-[#c4c4cc]" aria-hidden />
              <h2 className="text-lg font-bold text-white">Filtros</h2>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-[#7c7c8a] transition-colors hover:text-[#35BED5]"
            >
              Limpar filtros
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleClear}
            className="ml-auto text-xs text-[#7c7c8a] transition-colors hover:text-[#35BED5]"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <FilterSection title="Nível">
        {LEVEL_OPTIONS.map((option) => (
          <label
            key={option.value}
            htmlFor={`level-${option.value}`}
            className="flex cursor-pointer items-center gap-3"
          >
            <Checkbox
              id={`level-${option.value}`}
              checked={filters.levels.includes(option.value)}
              onCheckedChange={() => toggleLevel(option.value)}
            />
            <span className="text-base text-[#c4c4cc]">{option.label}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection
        title="Preço"
        action={
          <Link
            href="/plans"
            className="text-xs font-medium text-[#35BED5] hover:underline"
          >
            Ver planos
          </Link>
        }
      >
        {PRICE_OPTIONS.map((option) => (
          <label
            key={option.value}
            htmlFor={`price-${option.value}`}
            className="flex cursor-pointer items-center gap-3"
          >
            <Checkbox
              id={`price-${option.value}`}
              checked={filters.prices.includes(option.value)}
              onCheckedChange={() => togglePrice(option.value)}
            />
            <span className="text-base text-[#c4c4cc]">{option.label}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Tipo">
        {TYPE_OPTIONS.map((option) => (
          <label
            key={option.value}
            htmlFor={`type-${option.value}`}
            className="flex cursor-pointer items-center gap-3"
          >
            <Checkbox
              id={`type-${option.value}`}
              checked={filters.types.includes(option.value)}
              onCheckedChange={() => toggleType(option.value)}
            />
            <span className="text-base text-[#c4c4cc]">{option.label}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Duração média">
        {DURATION_OPTIONS.map((option) => (
          <label
            key={option.value}
            htmlFor={`duration-${option.value}`}
            className="flex cursor-pointer items-center gap-3"
          >
            <input
              type="radio"
              id={`duration-${option.value}`}
              name="catalog-duration"
              checked={filters.duration === option.value}
              onChange={() => setDuration(option.value)}
              className="h-4 w-4 shrink-0 accent-[#35BED5]"
            />
            <span className="text-base text-[#c4c4cc]">{option.label}</span>
          </label>
        ))}
      </FilterSection>
    </aside>
  )
}
