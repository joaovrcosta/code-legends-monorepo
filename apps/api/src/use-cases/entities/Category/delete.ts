import { ICategoryRepository } from "../../../repositories/category-repository";
import { CategoryNotFoundError } from "../../errors/category-not-found";

interface DeleteCategoryRequest {
  id: string;
}

export class DeleteCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(data: DeleteCategoryRequest): Promise<void> {
    // Verificar se a categoria existe
    const category = await this.categoryRepository.findById(data.id);

    if (!category) {
      throw new CategoryNotFoundError();
    }

    await this.categoryRepository.delete(data.id);
  }
}
