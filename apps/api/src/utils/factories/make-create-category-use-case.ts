import { PrismaCategoryRepository } from "../../repositories/prisma/prisma-category-repository";
import { CreateCategoryUseCase } from "../../use-cases/entities/Category/create";

export function makeCreateCategoryUseCase() {
  const categoryRepository = new PrismaCategoryRepository();
  const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository);

  return createCategoryUseCase;
}
