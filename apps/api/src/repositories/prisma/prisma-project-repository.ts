import { Project } from '@prisma/client'
import { IProjectRepository } from '../project-repository'
import { prisma } from '../../lib/prisma'

export class PrismaProjectRepository implements IProjectRepository {
  async upsert(
    lessonId: number,
    data: { description?: string; specs?: unknown },
  ): Promise<Project> {
    return prisma.project.upsert({
      where: { lessonId },
      create: {
        lessonId,
        description: data.description ?? '',
        specs: data.specs ?? undefined,
      },
      update: {
        ...(data.description !== undefined && { description: data.description }),
        ...(data.specs !== undefined && { specs: data.specs }),
      },
    })
  }

  async findByLessonId(lessonId: number): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { lessonId },
    })
  }
}
