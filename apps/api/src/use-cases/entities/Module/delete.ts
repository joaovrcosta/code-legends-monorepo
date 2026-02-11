import { IModuleRepository } from "../../../repositories/module-repository";
import { ModuleNotFoundError } from "../../errors/module-not-found";

interface DeleteModuleRequest {
  id: string;
}

export class DeleteModuleUseCase {
  constructor(private moduleRepository: IModuleRepository) {}

  async execute(data: DeleteModuleRequest): Promise<void> {
    // Verificar se o módulo existe
    const module = await this.moduleRepository.findById(data.id);

    if (!module) {
      throw new ModuleNotFoundError();
    }

    await this.moduleRepository.delete(data.id);
  }
}
