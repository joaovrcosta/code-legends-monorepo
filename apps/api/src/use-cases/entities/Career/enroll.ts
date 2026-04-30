import { UserCareer } from '@prisma/client'
import { ICareerRepository } from '../../../repositories/career-repository'
import { IUserCareerRepository } from '../../../repositories/user-career-repository'
import { CareerNotFoundError } from '../../errors/career-not-found'

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

    const userCareer = await this.userCareerRepository.enroll(userId, careerId)
    return { userCareer }
  }
}

