import { UserCareer } from '@prisma/client'

export interface IUserCareerRepository {
  enroll(userId: string, careerId: string): Promise<UserCareer>
  findByUserAndCareer(
    userId: string,
    careerId: string,
  ): Promise<UserCareer | null>
  update(id: string, data: Partial<UserCareer>): Promise<UserCareer>
}

