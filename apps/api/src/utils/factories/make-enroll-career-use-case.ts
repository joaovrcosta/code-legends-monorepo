import { PrismaCareerRepository } from '../../repositories/prisma/prisma-career-repository'
import { PrismaUserCareerRepository } from '../../repositories/prisma/prisma-user-career-repository'
import { PrismaUsersRepository } from '../../repositories/prisma/prisma-users-reposity'
import { EnrollCareerUseCase } from '../../use-cases/entities/Career/enroll'

export function makeEnrollCareerUseCase() {
  const userCareerRepository = new PrismaUserCareerRepository()
  const careerRepository = new PrismaCareerRepository()
  const usersRepository = new PrismaUsersRepository()
  return new EnrollCareerUseCase(
    userCareerRepository,
    careerRepository,
    usersRepository,
  )
}

