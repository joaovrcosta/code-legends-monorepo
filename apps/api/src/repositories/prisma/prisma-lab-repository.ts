import { Lab } from '@prisma/client'
import { ILabRepository, LabUpsertData } from '../lab-repository'
import { prisma } from '../../lib/prisma'

export class PrismaLabRepository implements ILabRepository {
  async upsert(lessonId: number, data: LabUpsertData): Promise<Lab> {
    return prisma.lab.upsert({
      where: { lessonId },
      create: {
        lessonId,
        description: data.description ?? '',
        category: data.category ?? null,
        learnTitle: data.learnTitle ?? null,
        durationMinutes: data.durationMinutes ?? null,
        learnBody: data.learnBody ?? null,
        specs: data.specs ?? undefined,
      },
      update: {
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.learnTitle !== undefined && { learnTitle: data.learnTitle }),
        ...(data.durationMinutes !== undefined && {
          durationMinutes: data.durationMinutes,
        }),
        ...(data.learnBody !== undefined && { learnBody: data.learnBody }),
        ...(data.specs !== undefined && { specs: data.specs }),
      },
    })
  }

  async findByLessonId(lessonId: number): Promise<Lab | null> {
    return prisma.lab.findUnique({
      where: { lessonId },
    })
  }
}
