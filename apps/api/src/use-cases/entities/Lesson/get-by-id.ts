import { Lesson } from '@prisma/client'
import { ILessonRepository } from '../../../repositories/lesson-repository'
import { LessonNotFoundError } from '../../errors/lesson-not-found'

interface GetLessonByIdRequest {
  lessonId: number
}

interface GetLessonByIdResponse {
  lesson: Lesson
}

export class GetLessonByIdUseCase {
  constructor(private lessonRepository: ILessonRepository) {}

  async execute({
    lessonId,
  }: GetLessonByIdRequest): Promise<GetLessonByIdResponse> {
    const lesson = await this.lessonRepository.findById(lessonId)

    if (!lesson) {
      throw new LessonNotFoundError()
    }

    return { lesson }
  }
}
