import { Submodule } from "@prisma/client";
import { IGroupRepository } from "../../../repositories/group-repository";

interface ListGroupsRequest {
  moduleId?: string;
}

interface ListGroupsResponse {
  groups: Submodule[];
}

export class ListGroupsUseCase {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(filters?: ListGroupsRequest): Promise<ListGroupsResponse> {
    const groups = await this.groupRepository.findAll(filters?.moduleId);

    return {
      groups,
    };
  }
}
