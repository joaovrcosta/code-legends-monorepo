import {
  Prisma,
  VideoProviderAuditAction,
  VideoProviderStatus,
} from '@prisma/client'
import { prisma } from '../../lib/prisma'
import {
  CreateVideoProviderInput,
  IVideoProviderRepository,
} from '../video-provider-repository'

export class PrismaVideoProviderRepository implements IVideoProviderRepository {
  async findById(id: string) {
    return prisma.videoProvider.findUnique({ where: { id } })
  }

  async findBySlug(slug: string) {
    return prisma.videoProvider.findUnique({ where: { slug } })
  }

  async findDefault() {
    return prisma.videoProvider.findFirst({
      where: { isDefault: true, status: 'ACTIVE' },
    })
  }

  async list(options?: {
    includeDeprecated?: boolean
    status?: VideoProviderStatus
  }) {
    const statusFilter = options?.status
      ? { status: options.status }
      : options?.includeDeprecated
        ? {}
        : { status: { in: ['ACTIVE', 'DEPRECATED'] as VideoProviderStatus[] } }

    return prisma.videoProvider.findMany({
      where: statusFilter,
      orderBy: [{ isDefault: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { videos: true } } },
    })
  }

  async countCustom() {
    return prisma.videoProvider.count({ where: { isBuiltin: false } })
  }

  async create(data: CreateVideoProviderInput) {
    return prisma.videoProvider.create({
      data: {
        name: data.name,
        slug: data.slug,
        handlerKey: data.handlerKey,
        isBuiltin: false,
        urlPlaceholder: data.urlPlaceholder,
        helpText: data.helpText ?? null,
        allowedDomains: data.allowedDomains,
        allowedProtocols: data.allowedProtocols ?? ['https'],
        maxUrlLength: data.maxUrlLength ?? 2048,
        sortOrder: data.sortOrder ?? 100,
        createdById: data.createdById ?? null,
      },
    })
  }

  async update(id: string, data: Prisma.VideoProviderUpdateInput) {
    return prisma.videoProvider.update({ where: { id }, data })
  }

  async clearDefaultExcept(providerId: string) {
    await prisma.videoProvider.updateMany({
      where: { id: { not: providerId }, isDefault: true },
      data: { isDefault: false },
    })
  }

  async createAuditLog(data: {
    providerId: string
    actorId: string
    action: VideoProviderAuditAction
    before?: Prisma.InputJsonValue
    after?: Prisma.InputJsonValue
  }) {
    await prisma.videoProviderAuditLog.create({ data })
  }

  async countVideosUsingProvider(providerId: string) {
    return prisma.video.count({ where: { providerId } })
  }
}
