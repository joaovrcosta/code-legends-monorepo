import { prisma } from '../../../lib/prisma'

export type LessonProductionItem = {
  lessonId: number
  status: string
  priority: string
  notes: string | null
  updatedAt: string
  updatedById: string
}

export class GetLessonProductionByCourseUseCase {
  async execute(courseId: string): Promise<LessonProductionItem[]> {
    const lessons = await prisma.lesson.findMany({
      where: { submodule: { module: { courseId } } },
      select: {
        id: true,
        production: {
          select: {
            status: true,
            priority: true,
            notes: true,
            updatedAt: true,
            updatedById: true,
          },
        },
      },
    })

    return lessons
      .filter((l) => l.production != null)
      .map((l) => ({
        lessonId: l.id,
        status: l.production!.status,
        priority: l.production!.priority,
        notes: l.production!.notes ?? null,
        updatedAt: l.production!.updatedAt.toISOString(),
        updatedById: l.production!.updatedById,
      }))
  }
}
