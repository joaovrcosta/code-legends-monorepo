import { LessonProductionStatus } from '@prisma/client'
import { prisma } from '../../../lib/prisma'

export type UpsertLessonProductionInput = {
  lessonId: number
  status: LessonProductionStatus
  notes: string | null
  actorId: string
}

export type UpsertLessonProductionOutput = {
  lessonId: number
  status: LessonProductionStatus
  notes: string | null
  updatedAt: string
  updatedById: string
}

export class UpsertLessonProductionUseCase {
  async execute(input: UpsertLessonProductionInput): Promise<UpsertLessonProductionOutput> {
    const { lessonId, status, notes, actorId } = input

    // precisamos do courseId para gravar no log (para consultas rápidas por curso)
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
        production: { select: { status: true } },
      },
    })
    if (!lesson) {
      throw new Error('Lesson not found')
    }

    const courseId = lesson.submodule.module.courseId
    const prevStatus = lesson.production?.status ?? LessonProductionStatus.TODO

    const [row] = await prisma.$transaction([
      prisma.lessonProduction.upsert({
        where: { lessonId },
        create: {
          lessonId,
          status,
          notes,
          updatedById: actorId,
        },
        update: {
          status,
          notes,
          updatedById: actorId,
        },
        select: {
          lessonId: true,
          status: true,
          notes: true,
          updatedAt: true,
          updatedById: true,
        },
      }),
      ...(prevStatus === status
        ? []
        : [
            prisma.lessonProductionLog.create({
              data: {
                lessonId,
                courseId,
                fromStatus: prevStatus,
                toStatus: status,
                actorId,
              },
              select: { id: true },
            }),
          ]),
    ])

    return {
      lessonId: row.lessonId,
      status: row.status,
      notes: row.notes ?? null,
      updatedAt: row.updatedAt.toISOString(),
      updatedById: row.updatedById,
    }
  }
}

