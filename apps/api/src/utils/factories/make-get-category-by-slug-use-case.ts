import { PrismaCategoryRepository } from "../../repositories/prisma/prisma-category-repository";
import { GetCategoryBySlugUseCase } from "../../use-cases/entities/Category/get-by-slug";

export function makeGetCategoryBySlugUseCase() {
  const categoryRepository = new PrismaCategoryRepository();
  const getCategoryBySlugUseCase = new GetCategoryBySlugUseCase(categoryRepository);

  return getCategoryBySlugUseCase;
}

