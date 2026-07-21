import { PrismaUserProgressRepository } from '../../repositories/prisma/prisma-user-progress-repository'
import { PrismaUserCourseRepository } from '../../repositories/prisma/prisma-user-course-repository'
import {
  GetLabProgressUseCase,
  UpsertLabProgressUseCase,
} from '../../use-cases/entities/Lesson/lab-progress'

export function makeGetLabProgressUseCase() {
  return new GetLabProgressUseCase(new PrismaUserProgressRepository())
}

export function makeUpsertLabProgressUseCase() {
  return new UpsertLabProgressUseCase(
    new PrismaUserProgressRepository(),
    new PrismaUserCourseRepository(),
  )
}
