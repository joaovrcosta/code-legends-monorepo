import { IGroupRepository } from "../../../repositories/group-repository";
import { GroupNotFoundError } from "../../errors/group-not-found";

interface DeleteGroupRequest {
  id: number;
}

export class DeleteGroupUseCase {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(data: DeleteGroupRequest): Promise<void> {
    // Verificar se o grupo existe
    const group = await this.groupRepository.findById(data.id);

    if (!group) {
      throw new GroupNotFoundError();
    }

    await this.groupRepository.delete(data.id);
  }
}
