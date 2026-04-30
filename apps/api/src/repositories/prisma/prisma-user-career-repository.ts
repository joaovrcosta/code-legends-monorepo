import { UserCareer } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { IUserCareerRepository } from '../user-career-repository'

export class PrismaUserCareerRepository implements IUserCareerRepository {
  async enroll(userId: string, careerId: string): Promise<UserCareer> {
    const existing = await this.findByUserAndCareer(userId, careerId)
    if (existing) return existing

    return prisma.userCareer.create({
      data: {
        userId,
        careerId,
        enrolledAt: new Date(),
        lastAccessedAt: new Date(),
        progress: 0.0,
        isCompleted: false,
      },
    })
  }

  async findByUserAndCareer(
    userId: string,
    careerId: string,
  ): Promise<UserCareer | null> {
    return prisma.userCareer.findUnique({
      where: {
        userId_careerId: {
          userId,
          careerId,
        },
      },
    })
  }

  async update(id: string, data: Partial<UserCareer>): Promise<UserCareer> {
    const updateData: any = {}
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) updateData[key] = value
    }

    return prisma.userCareer.update({
      where: { id },
      data: {
        ...updateData,
        lastAccessedAt: new Date(),
      },
    })
  }
}

