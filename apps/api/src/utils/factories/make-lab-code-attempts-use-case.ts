import { PrismaLabCodeAttemptRepository } from '../../repositories/prisma/prisma-lab-code-attempt-repository'
import {
  CreateLabCodeAttemptUseCase,
  ListLabCodeAttemptsUseCase,
  PruneLabCodeAttemptsUseCase,
} from '../../use-cases/entities/Lesson/lab-code-attempts'
import { PrismaUserCourseRepository } from '../../repositories/prisma/prisma-user-course-repository'

export function makeCreateLabCodeAttemptUseCase() {
  return new CreateLabCodeAttemptUseCase(
    new PrismaLabCodeAttemptRepository(),
    new PrismaUserCourseRepository(),
  )
}

export function makeListLabCodeAttemptsUseCase() {
  return new ListLabCodeAttemptsUseCase(new PrismaLabCodeAttemptRepository())
}

export function makePruneLabCodeAttemptsUseCase() {
  return new PruneLabCodeAttemptsUseCase(new PrismaLabCodeAttemptRepository())
}
