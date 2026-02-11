import { Category } from "@prisma/client";
import { ICategoryRepository } from "../../../repositories/category-repository";
import { CategoryNotFoundError } from "../../errors/category-not-found";

interface GetCategoryBySlugRequest {
  slug: string;
}

interface GetCategoryBySlugResponse {
  category: Category;
}

export class GetCategoryBySlugUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute({
    slug,
  }: GetCategoryBySlugRequest): Promise<GetCategoryBySlugResponse> {
    const category = await this.categoryRepository.findBySlug(slug);

    if (!category) {
      throw new CategoryNotFoundError();
    }

    return {
      category,
    };
  }
}
