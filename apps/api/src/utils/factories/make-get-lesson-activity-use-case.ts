import { GetLessonActivityUseCase } from '../../use-cases/entities/Account/get-lesson-activity'

export function makeGetLessonActivityUseCase() {
  return new GetLessonActivityUseCase()
}

