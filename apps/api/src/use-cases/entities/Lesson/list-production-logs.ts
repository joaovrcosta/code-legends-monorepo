import { prisma } from '../../../lib/prisma'

export type LessonProductionLogRow = {
  id: string
  lessonId: number
  lessonTitle: string
  fromStatus: string
  toStatus: string
  actorId: string
  actorName: string
  actorAvatar: string | null
  createdAt: string
}

export type ListLessonProductionLogsInput = {
  courseId: string
  limit: number
  cursor?: string | null
}

export type ListLessonProductionLogsOutput = {
  items: LessonProductionLogRow[]
  nextCursor: string | null
}

export class ListLessonProductionLogsUseCase {
  async execute(input: ListLessonProductionLogsInput): Promise<ListLessonProductionLogsOutput> {
    const limit = Math.min(Math.max(input.limit, 1), 100)

    const rows = await prisma.lessonProductionLog.findMany({
      where: { courseId: input.courseId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(input.cursor
        ? {
            cursor: { id: input.cursor },
            skip: 1,
          }
        : {}),
      select: {
        id: true,
        lessonId: true,
        fromStatus: true,
        toStatus: true,
        actorId: true,
        createdAt: true,
        lesson: { select: { title: true } },
        actor: { select: { name: true, avatar: true } },
      },
    })

    const slice = rows.slice(0, limit)
    const nextCursor = rows.length > limit ? rows[limit]!.id : null

    return {
      items: slice.map((r) => ({
        id: r.id,
        lessonId: r.lessonId,
        lessonTitle: r.lesson.title,
        fromStatus: r.fromStatus,
        toStatus: r.toStatus,
        actorId: r.actorId,
        actorName: r.actor.name,
        actorAvatar: r.actor.avatar ?? null,
        createdAt: r.createdAt.toISOString(),
      })),
      nextCursor,
    }
  }
}

