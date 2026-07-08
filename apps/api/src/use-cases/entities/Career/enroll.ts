import { UserCareer } from '@prisma/client'
import { PlanFeatures } from '@code-legends/plans'
import { ICareerRepository } from '../../../repositories/career-repository'
import { IUserCareerRepository } from '../../../repositories/user-career-repository'
import { IUsersRepository } from '../../../repositories/users-repository'
import { PlanAccessPort } from '../../../domain/plan-access/plan-access.port'
import { CareerNotFoundError } from '../../errors/career-not-found'
import { CareerEnrollmentRequiresPremiumError } from '../../errors/career-enrollment-requires-premium'
import { UserNotFoundError } from '../../errors/user-not-found'
import { enrollUserInCareerPathUnits } from '../../../utils/path-unit-access'

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
    private planAccess: PlanAccessPort,
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

    const canEnroll = await this.planAccess.hasFeature(
      userId,
      PlanFeatures.CAREER_ENROLL,
    )
    if (!canEnroll) {
      const hasCatalogPaid = await this.planAccess.hasFeature(
        userId,
        PlanFeatures.CATALOG_PAID,
      )
      throw new CareerEnrollmentRequiresPremiumError(
        hasCatalogPaid ? 'PRO' : 'FREE',
      )
    }

    const userCareer = await this.userCareerRepository.enroll(userId, careerId)
    await enrollUserInCareerPathUnits(userId, careerId)
    return { userCareer }
  }
}
