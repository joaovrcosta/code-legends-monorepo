import { PrismaCategoryRepository } from "../../repositories/prisma/prisma-category-repository";
import { UpdateCategoryUseCase } from "../../use-cases/entities/Category/update";

export function makeUpdateCategoryUseCase() {
  const categoryRepository = new PrismaCategoryRepository();
  const updateCategoryUseCase = new UpdateCategoryUseCase(categoryRepository);

  return updateCategoryUseCase;
}
