import { PrismaCategoryRepository } from "../../repositories/prisma/prisma-category-repository";
import { ListCategoriesUseCase } from "../../use-cases/entities/Category/list";

export function makeListCategoriesUseCase() {
  const categoryRepository = new PrismaCategoryRepository();
  const listCategoriesUseCase = new ListCategoriesUseCase(categoryRepository);

  return listCategoriesUseCase;
}
