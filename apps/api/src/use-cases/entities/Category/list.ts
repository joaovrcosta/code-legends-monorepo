import { Category } from "@prisma/client";
import { ICategoryRepository } from "../../../repositories/category-repository";

interface ListCategoriesResponse {
  categories: Category[];
}

export class ListCategoriesUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(): Promise<ListCategoriesResponse> {
    const categories = await this.categoryRepository.findAll();

    return {
      categories,
    };
  }
}
