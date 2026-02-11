import { Group } from "@prisma/client";
import { IGroupRepository } from "../../../repositories/group-repository";
import { IModuleRepository } from "../../../repositories/module-repository";
import { GroupAlreadyExistsError } from "../../errors/group-already-exists";
import { ModuleNotFoundError } from "../../errors/module-not-found";

interface CreateGroupRequest {
  title: string;
  moduleId: string;
}

interface CreateGroupResponse {
  group: Group;
}

export class CreateGroupUseCase {
  constructor(
    private groupRepository: IGroupRepository,
    private moduleRepository: IModuleRepository
  ) {}

  async execute(data: CreateGroupRequest): Promise<CreateGroupResponse> {
    // Verificar se o módulo existe
    const module = await this.moduleRepository.findById(data.moduleId);

    if (!module) {
      throw new ModuleNotFoundError();
    }

    // Verificar se o grupo já existe neste módulo
    const groupWithSameTitleInModule =
      await this.groupRepository.findByTitleAndModuleId(
        data.title,
        data.moduleId
      );

    if (groupWithSameTitleInModule) {
      throw new GroupAlreadyExistsError();
    }

    const group = await this.groupRepository.create(data);

    return {
      group,
    };
  }
}
