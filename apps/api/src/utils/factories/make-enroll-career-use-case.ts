import { PrismaCareerRepository } from '../../repositories/prisma/prisma-career-repository'
import { PrismaUserCareerRepository } from '../../repositories/prisma/prisma-user-career-repository'
import { EnrollCareerUseCase } from '../../use-cases/entities/Career/enroll'

export function makeEnrollCareerUseCase() {
  const userCareerRepository = new PrismaUserCareerRepository()
  const careerRepository = new PrismaCareerRepository()
  return new EnrollCareerUseCase(userCareerRepository, careerRepository)
}

