import { GetCareerBySlugUseCase } from '../../use-cases/entities/Career/get-by-slug'

export function makeGetCareerBySlugUseCase() {
  return new GetCareerBySlugUseCase()
}

