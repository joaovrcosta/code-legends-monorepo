import type { CourseWithCount } from '@/types/user-course.ts'
import type { CareerTrack } from '@/components/learn/catolog/career-tracks-section'

export type CatalogLevel = 'beginner' | 'intermediate' | 'advanced'
export type CatalogPrice = 'free' | 'paid'
export type CatalogContentType = 'course' | 'career'
export type CatalogDuration = 'all' | 'lt5' | '5to10' | 'gt10'

export type CatalogFiltersState = {
  levels: CatalogLevel[]
  prices: CatalogPrice[]
  types: CatalogContentType[]
  duration: CatalogDuration
}

export const DEFAULT_CATALOG_FILTERS: CatalogFiltersState = {
  levels: [],
  prices: [],
  types: [],
  duration: 'all',
}

export const LEVEL_OPTIONS: { value: CatalogLevel; label: string }[] = [
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
]

export const PRICE_OPTIONS: { value: CatalogPrice; label: string }[] = [
  { value: 'free', label: 'Grátis' },
  { value: 'paid', label: 'Pago' },
]

export const TYPE_OPTIONS: { value: CatalogContentType; label: string }[] = [
  { value: 'course', label: 'Curso' },
  { value: 'career', label: 'Trilha de carreira' },
]

export const DURATION_OPTIONS: { value: CatalogDuration; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'lt5', label: 'Menos de 5 horas' },
  { value: '5to10', label: '5–10 horas' },
  { value: 'gt10', label: 'Mais de 10 horas' },
]

export function normalizeLevel(level: string | undefined | null): CatalogLevel | null {
  const normalized = (level ?? '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  switch (normalized) {
    case 'beginner':
    case 'iniciante':
      return 'beginner'
    case 'intermediate':
    case 'intermediario':
      return 'intermediate'
    case 'advanced':
    case 'avancado':
      return 'advanced'
    default:
      return null
  }
}

/** Converte strings como "3h 30min" ou "45min" em horas decimais. */
export function parseDurationHours(duration: string | null | undefined): number | null {
  if (!duration?.trim()) return null

  const text = duration.trim().toLowerCase()
  let totalHours = 0
  let matched = false

  const hoursMatch = text.match(/(\d+(?:[.,]\d+)?)\s*h/)
  if (hoursMatch) {
    totalHours += parseFloat(hoursMatch[1].replace(',', '.'))
    matched = true
  }

  const minutesMatch = text.match(/(\d+)\s*m(?:in)?/)
  if (minutesMatch) {
    totalHours += parseInt(minutesMatch[1], 10) / 60
    matched = true
  }

  return matched ? totalHours : null
}

function matchesDuration(
  duration: CatalogDuration,
  totalDuration: string | null | undefined,
): boolean {
  if (duration === 'all') return true

  const hours = parseDurationHours(totalDuration)
  if (hours === null) return false

  switch (duration) {
    case 'lt5':
      return hours < 5
    case '5to10':
      return hours >= 5 && hours <= 10
    case 'gt10':
      return hours > 10
    default:
      return true
  }
}

function matchesLevel(levels: CatalogLevel[], courseLevel: string | undefined): boolean {
  if (levels.length === 0) return true
  const normalized = normalizeLevel(courseLevel)
  return normalized !== null && levels.includes(normalized)
}

function matchesPrice(prices: CatalogPrice[], isFree: boolean): boolean {
  if (prices.length === 0) return true
  return (
    (prices.includes('free') && isFree) ||
    (prices.includes('paid') && !isFree)
  )
}

function matchesType(types: CatalogContentType[], contentType: CatalogContentType): boolean {
  if (types.length === 0) return true
  return types.includes(contentType)
}

export function hasActiveFilters(filters: CatalogFiltersState): boolean {
  return (
    filters.levels.length > 0 ||
    filters.prices.length > 0 ||
    filters.types.length > 0 ||
    filters.duration !== 'all'
  )
}

export function countActiveFilters(filters: CatalogFiltersState): number {
  let count = 0
  count += filters.levels.length
  count += filters.prices.length
  count += filters.types.length
  if (filters.duration !== 'all') count += 1
  return count
}

export function filterCourses(
  courses: CourseWithCount[],
  filters: CatalogFiltersState,
): CourseWithCount[] {
  if (!hasActiveFilters(filters)) return courses

  const includeCourses = matchesType(filters.types, 'course')

  if (!includeCourses) return []

  return courses.filter((course) => {
    return (
      matchesLevel(filters.levels, course.level) &&
      matchesPrice(filters.prices, course.isFree) &&
      matchesDuration(filters.duration, course.totalDuration)
    )
  })
}

export function filterCareerTracks(
  tracks: CareerTrack[],
  filters: CatalogFiltersState,
): CareerTrack[] {
  if (!hasActiveFilters(filters)) return tracks

  const includeCareers = matchesType(filters.types, 'career')
  if (!includeCareers) return []

  const hasCourseOnlyFilters =
    filters.levels.length > 0 ||
    filters.prices.length > 0 ||
    filters.duration !== 'all'

  if (hasCourseOnlyFilters && filters.types.length === 0) {
    return []
  }

  return tracks
}

export function getTrendingCourses(courses: CourseWithCount[]): CourseWithCount[] {
  return [...courses].sort((a, b) => (b.subscriptions ?? 0) - (a.subscriptions ?? 0))
}

export function getFreeCourses(courses: CourseWithCount[]): CourseWithCount[] {
  return courses.filter((course) => course.isFree)
}
