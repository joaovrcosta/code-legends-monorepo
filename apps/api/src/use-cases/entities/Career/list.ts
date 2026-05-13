import { prisma } from '../../../lib/prisma'

export interface ListCareersResponse {
  careers: Array<{
    id: string
    slug: string
    title: string
    description: string | null
    thumbnail: string | null
    icon: string | null
    colorHex: string | null
    modulesCount: number
  }>
}

export class ListCareersUseCase {
  async execute(): Promise<ListCareersResponse> {
    const careers = await prisma.career.findMany({
      where: { active: true },
      include: {
        _count: {
          select: {
            modules: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return {
      careers: careers.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        thumbnail: c.thumbnail,
        icon: c.icon,
        colorHex: c.colorHex,
        modulesCount: c._count.modules,
      })),
    }
  }
}

