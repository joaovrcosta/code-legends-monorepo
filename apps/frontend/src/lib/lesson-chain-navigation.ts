import type { RoadmapLesson, LessonType } from '@/types/roadmap'
import type { LessonResponse } from '@/actions/course/lesson-by-slug-shared'

const NON_VIDEO_TYPES: LessonType[] = [
  'article',
  'text',
  'quiz',
  'multi_quiz',
  'project',
  'lab',
]

export function isVideoLessonType(type: LessonType | string | undefined): boolean {
  return type === 'video'
}

export function blocksAutoplayChain(type: LessonType | string | undefined): boolean {
  if (!type) return true
  return NON_VIDEO_TYPES.includes(type as LessonType)
}

export function findLessonBySlug(
  lessons: RoadmapLesson[],
  slug: string,
): RoadmapLesson | undefined {
  return lessons.find((l) => l.slug === slug)
}

type LessonNavNext = NonNullable<
  NonNullable<LessonResponse['navigation']>['next']
>

export function resolveAutoplayNextVideo(
  navigation: LessonResponse['navigation'] | undefined,
  allLessons: RoadmapLesson[],
): LessonNavNext | null {
  const next = navigation?.next
  if (!next) return null

  const nextLesson = findLessonBySlug(allLessons, next.slug)
  if (!nextLesson) return null
  if (blocksAutoplayChain(nextLesson.type)) return null
  if (nextLesson.status === 'locked') return null
  if (!isVideoLessonType(nextLesson.type)) return null

  return next
}
