import { Group } from "@prisma/client";
import { IGroupRepository } from "../../../repositories/group-repository";
import { GroupNotFoundError } from "../../errors/group-not-found";
import { GroupAlreadyExistsError } from "../../errors/group-already-exists";

interface UpdateGroupRequest {
  id: number;
  title?: string;
}

interface UpdateGroupResponse {
  group: Group;
}

export class UpdateGroupUseCase {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(data: UpdateGroupRequest): Promise<UpdateGroupResponse> {
    // Verificar se o grupo existe
    const group = await this.groupRepository.findById(data.id);

    if (!group) {
      throw new GroupNotFoundError();
    }

    // Se está alterando o título, verificar se não existe outro grupo com o mesmo título no mesmo módulo
    if (data.title && data.title !== group.title) {
      const groupWithSameTitle =
        await this.groupRepository.findByTitleAndModuleId(
          data.title,
          group.moduleId
        );

      if (groupWithSameTitle) {
        throw new GroupAlreadyExistsError();
      }
    }

    const updatedGroup = await this.groupRepository.update(data.id, {
      title: data.title,
    });

    return {
      group: updatedGroup,
    };
  }
}
