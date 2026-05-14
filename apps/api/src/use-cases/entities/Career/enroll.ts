import { UserCareer } from '@prisma/client'
import { ICareerRepository } from '../../../repositories/career-repository'
import { IUserCareerRepository } from '../../../repositories/user-career-repository'
import { IUsersRepository } from '../../../repositories/users-repository'
import { CareerNotFoundError } from '../../errors/career-not-found'
import { CareerEnrollmentRequiresPremiumError } from '../../errors/career-enrollment-requires-premium'
import { UserNotFoundError } from '../../errors/user-not-found'

interface EnrollCareerRequest {
  userId: string
  careerId: string
}

interface EnrollCareerResponse {
  userCareer: UserCareer
}

export class EnrollCareerUseCase {
  constructor(
    private userCareerRepository: IUserCareerRepository,
    private careerRepository: ICareerRepository,
    private usersRepository: IUsersRepository,
  ) {}

  async execute({
    userId,
    careerId,
  }: EnrollCareerRequest): Promise<EnrollCareerResponse> {
    const career = await this.careerRepository.findById(careerId)
    if (!career || !career.active) {
      throw new CareerNotFoundError()
    }

    const existing = await this.userCareerRepository.findByUserAndCareer(
      userId,
      careerId,
    )
    if (existing) {
      return { userCareer: existing }
    }

    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new UserNotFoundError()
    }
    if (user.plan !== 'PREMIUM') {
      throw new CareerEnrollmentRequiresPremiumError(
        user.plan === 'PRO' ? 'PRO' : 'FREE',
      )
    }

    const userCareer = await this.userCareerRepository.enroll(userId, careerId)
    return { userCareer }
  }
}

