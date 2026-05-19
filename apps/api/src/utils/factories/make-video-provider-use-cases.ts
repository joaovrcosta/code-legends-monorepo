import { PrismaVideoProviderRepository } from '../../repositories/prisma/prisma-video-provider-repository'
import {
  CreateVideoProviderUseCase,
  ListVideoProvidersUseCase,
  SetDefaultVideoProviderUseCase,
  SetVideoProviderStatusUseCase,
  UpdateVideoProviderUseCase,
} from '../../use-cases/entities/VideoProvider/manage-video-providers'

const repo = new PrismaVideoProviderRepository()

export function makeListVideoProvidersUseCase() {
  return new ListVideoProvidersUseCase(repo)
}

export function makeCreateVideoProviderUseCase() {
  return new CreateVideoProviderUseCase(repo)
}

export function makeUpdateVideoProviderUseCase() {
  return new UpdateVideoProviderUseCase(repo)
}

export function makeSetDefaultVideoProviderUseCase() {
  return new SetDefaultVideoProviderUseCase(repo)
}

export function makeSetVideoProviderStatusUseCase() {
  return new SetVideoProviderStatusUseCase(repo)
}

export function makeVideoProviderRepository() {
  return repo
}
