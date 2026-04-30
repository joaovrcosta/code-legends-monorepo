import { Career } from '@prisma/client'

export interface ICreateCareerData {
  slug: string
  title: string
  description?: string | null
  thumbnail?: string | null
  colorHex?: string | null
  active?: boolean
}

export interface ICareerRepository {
  create(data: ICreateCareerData): Promise<Career>
  findAll(): Promise<Career[]>
  findById(id: string): Promise<Career | null>
  findBySlug(slug: string): Promise<Career | null>
}

