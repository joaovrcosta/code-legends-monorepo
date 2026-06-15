import { PrismaLessonRepository } from '../../repositories/prisma/prisma-lesson-repository'
import { GetLessonByIdUseCase } from '../../use-cases/entities/Lesson/get-by-id'

export function makeGetLessonByIdUseCase() {
  const lessonRepository = new PrismaLessonRepository()
  return new GetLessonByIdUseCase(lessonRepository)
}
