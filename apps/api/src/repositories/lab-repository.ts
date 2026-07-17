import { Lab } from '@prisma/client'

export type LabUpsertData = {
  description?: string
  category?: string | null
  learnTitle?: string | null
  durationMinutes?: number | null
  learnBody?: string | null
  specs?: unknown
}

export interface ILabRepository {
  upsert(lessonId: number, data: LabUpsertData): Promise<Lab>
  findByLessonId(lessonId: number): Promise<Lab | null>
}
