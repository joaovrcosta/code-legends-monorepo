import { Career } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import {
  ICareerRepository,
  ICreateCareerData,
} from '../career-repository'

export class PrismaCareerRepository implements ICareerRepository {
  async create(data: ICreateCareerData): Promise<Career> {
    return prisma.career.create({
      data: {
        slug: data.slug,
        title: data.title,
        description: data.description ?? null,
        thumbnail: data.thumbnail ?? null,
        colorHex: data.colorHex ?? null,
        active: data.active ?? true,
      },
    })
  }

  async findAll(): Promise<Career[]> {
    return prisma.career.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: string): Promise<Career | null> {
    return prisma.career.findUnique({ where: { id } })
  }

  async findBySlug(slug: string): Promise<Career | null> {
    return prisma.career.findUnique({ where: { slug } })
  }
}

