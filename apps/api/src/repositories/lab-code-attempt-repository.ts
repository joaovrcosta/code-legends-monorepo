import { LabCodeAttempt } from '@prisma/client'

export type LabAttemptResult = 'pass' | 'fail' | 'timeout' | 'error'

export interface ILabCodeAttemptRepository {
  create(data: {
    userId: string
    lessonId: number
    stepId: string
    files: Record<string, string>
    result: LabAttemptResult
  }): Promise<LabCodeAttempt>

  listByUserLesson(input: {
    userId: string
    lessonId: number
    stepId?: string
    take: number
    cursor?: string
  }): Promise<LabCodeAttempt[]>

  /**
   * Retenção: apaga excedente além de maxPerLesson,
   * e além de maxPerStep por stepId.
   */
  pruneRetention(input: {
    maxPerLesson: number
    maxPerStep: number
    batchUsers?: number
  }): Promise<{ deletedCount: number }>
}
