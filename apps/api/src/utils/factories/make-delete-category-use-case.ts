import { PrismaCategoryRepository } from "../../repositories/prisma/prisma-category-repository";
import { DeleteCategoryUseCase } from "../../use-cases/entities/Category/delete";

export function makeDeleteCategoryUseCase() {
  const categoryRepository = new PrismaCategoryRepository();
  const deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepository);

  return deleteCategoryUseCase;
}
