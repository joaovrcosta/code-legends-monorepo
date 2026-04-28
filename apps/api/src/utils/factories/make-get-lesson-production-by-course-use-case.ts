import { GetLessonProductionByCourseUseCase } from '../../use-cases/entities/Lesson/get-production-by-course'

export function makeGetLessonProductionByCourseUseCase() {
  return new GetLessonProductionByCourseUseCase()
}

