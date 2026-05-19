import {
  VideoProvider,
  VideoProviderAuditAction,
  VideoProviderStatus,
  Prisma,
} from '@prisma/client'

export interface CreateVideoProviderInput {
  name: string
  slug: string
  handlerKey: string
  urlPlaceholder: string
  helpText?: string | null
  allowedDomains: string[]
  allowedProtocols?: string[]
  maxUrlLength?: number
  sortOrder?: number
  createdById?: string | null
}

export interface IVideoProviderRepository {
  findById(id: string): Promise<VideoProvider | null>
  findBySlug(slug: string): Promise<VideoProvider | null>
  findDefault(): Promise<VideoProvider | null>
  list(options?: {
    includeDeprecated?: boolean
    status?: VideoProviderStatus
  }): Promise<(VideoProvider & { _count?: { videos: number } })[]>
  countCustom(): Promise<number>
  create(data: CreateVideoProviderInput): Promise<VideoProvider>
  update(
    id: string,
    data: Prisma.VideoProviderUpdateInput,
  ): Promise<VideoProvider>
  clearDefaultExcept(providerId: string): Promise<void>
  createAuditLog(data: {
    providerId: string
    actorId: string
    action: VideoProviderAuditAction
    before?: Prisma.InputJsonValue
    after?: Prisma.InputJsonValue
  }): Promise<void>
  countVideosUsingProvider(providerId: string): Promise<number>
}
