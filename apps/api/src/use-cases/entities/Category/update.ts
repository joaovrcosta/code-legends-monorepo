import { Category } from "@prisma/client";
import { ICategoryRepository } from "../../../repositories/category-repository";
import { CategoryNotFoundError } from "../../errors/category-not-found";
import { CategoryAlreadyExistsError } from "../../errors/category-already-exists";

interface UpdateCategoryRequest {
  id: string;
  name?: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  order?: number;
  active?: boolean;
}

interface UpdateCategoryResponse {
  category: Category;
}

export class UpdateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(data: UpdateCategoryRequest): Promise<UpdateCategoryResponse> {
    // Verificar se a categoria existe
    const category = await this.categoryRepository.findById(data.id);

    if (!category) {
      throw new CategoryNotFoundError();
    }

    // Se está alterando o slug, verificar se não existe outra categoria com o mesmo slug
    if (data.slug && data.slug !== category.slug) {
      const categoryWithSameSlug = await this.categoryRepository.findBySlug(
        data.slug
      );

      if (categoryWithSameSlug) {
        throw new CategoryAlreadyExistsError();
      }
    }

    const updatedCategory = await this.categoryRepository.update(data.id, {
      name: data.name,
      slug: data.slug,
      description: data.description,
      icon: data.icon,
      color: data.color,
      order: data.order,
      active: data.active,
    });

    return {
      category: updatedCategory,
    };
  }
}
