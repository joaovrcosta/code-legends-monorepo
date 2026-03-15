import { Project } from '@prisma/client'

export interface IProjectRepository {
  upsert(
    lessonId: number,
    data: { description?: string; specs?: unknown },
  ): Promise<Project>
  findByLessonId(lessonId: number): Promise<Project | null>
}
