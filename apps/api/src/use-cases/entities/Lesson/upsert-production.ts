import {
  LessonProductionPriority,
  LessonProductionStatus,
} from '@prisma/client'
import { prisma } from '../../../lib/prisma'

export type UpsertLessonProductionInput = {
  lessonId: number
  status?: LessonProductionStatus
  notes?: string | null
  priority?: LessonProductionPriority
  actorId: string
}

export type UpsertLessonProductionOutput = {
  lessonId: number
  status: LessonProductionStatus
  priority: LessonProductionPriority
  notes: string | null
  updatedAt: string
  updatedById: string
}

export class UpsertLessonProductionUseCase {
  async execute(input: UpsertLessonProductionInput): Promise<UpsertLessonProductionOutput> {
    const { lessonId, notes, priority, actorId } = input

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        submodule: {
          select: {
            module: {
              select: { courseId: true },
            },
          },
        },
        production: {
          select: { status: true, notes: true, priority: true },
        },
      },
    })
    if (!lesson) {
      throw new Error('Lesson not found')
    }

    const courseId = lesson.submodule.module.courseId
    const prevStatus =
      lesson.production?.status ?? LessonProductionStatus.TODO
    const nextStatus =
      input.status ?? lesson.production?.status ?? LessonProductionStatus.TODO
    const nextNotes =
      notes !== undefined
        ? notes
        : (lesson.production?.notes ?? null)
    const nextPriority =
      priority !== undefined
        ? priority
        : (lesson.production?.priority ?? LessonProductionPriority.NONE)

    const [row] = await prisma.$transaction([
      prisma.lessonProduction.upsert({
        where: { lessonId },
        create: {
          lessonId,
          status: nextStatus,
          notes: nextNotes,
          priority: nextPriority,
          updatedById: actorId,
        },
        update: {
          status: nextStatus,
          notes: nextNotes,
          priority: nextPriority,
          updatedById: actorId,
        },
        select: {
          lessonId: true,
          status: true,
          priority: true,
          notes: true,
          updatedAt: true,
          updatedById: true,
        },
      }),
      ...(prevStatus === nextStatus
        ? []
        : [
            prisma.lessonProductionLog.create({
              data: {
                lessonId,
                courseId,
                fromStatus: prevStatus,
                toStatus: nextStatus,
                actorId,
              },
              select: { id: true },
            }),
          ]),
    ])

    return {
      lessonId: row.lessonId,
      status: row.status,
      priority: row.priority,
      notes: row.notes ?? null,
      updatedAt: row.updatedAt.toISOString(),
      updatedById: row.updatedById,
    }
  }
}
