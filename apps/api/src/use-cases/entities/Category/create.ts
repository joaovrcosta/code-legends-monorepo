import { Category } from "@prisma/client";
import { ICategoryRepository } from "../../../repositories/category-repository";
import { CategoryAlreadyExistsError } from "../../errors/category-already-exists";

interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  order?: number;
  active?: boolean;
}

interface CreateCategoryResponse {
  category: Category;
}

export class CreateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(data: CreateCategoryRequest): Promise<CreateCategoryResponse> {
    // Verificar se a categoria já existe
    const categoryWithSameSlug = await this.categoryRepository.findBySlug(
      data.slug
    );

    if (categoryWithSameSlug) {
      throw new CategoryAlreadyExistsError();
    }

    const category = await this.categoryRepository.create(data);

    return {
      category,
    };
  }
}
