import { prisma } from '../../../lib/prisma'

export type LessonFreeSync = 'all_free' | 'all_paid' | 'keep'

export async function getLessonIdsByCourseId(courseId: string): Promise<number[]> {
  const modulesWithLessons = await prisma.module.findMany({
    where: { courseId },
    select: {
      submodules: {
        select: {
          lessons: {
            select: { id: true },
          },
        },
      },
    },
  })

  return modulesWithLessons.flatMap((module) =>
    module.submodules.flatMap((group) =>
      group.lessons.map((lesson) => lesson.id),
    ),
  )
}

export async function syncCourseLessonsIsFree(
  courseId: string,
  isFree: boolean,
): Promise<number> {
  const lessonIds = await getLessonIdsByCourseId(courseId)
  if (lessonIds.length === 0) return 0

  const result = await prisma.lesson.updateMany({
    where: { id: { in: lessonIds } },
    data: { isFree },
  })

  return result.count
}

export function resolveLessonFreeSyncAction(params: {
  wasFree: boolean
  isFreeNow: boolean
  explicit?: LessonFreeSync
}): 'all_free' | 'all_paid' | null {
  if (params.explicit === 'keep') return null
  if (params.explicit === 'all_free') return 'all_free'
  if (params.explicit === 'all_paid') return 'all_paid'

  if (!params.wasFree && params.isFreeNow) return 'all_free'

  return null
}
