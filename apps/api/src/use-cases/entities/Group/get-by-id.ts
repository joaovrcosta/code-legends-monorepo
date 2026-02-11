import { Group } from "@prisma/client";
import { IGroupRepository } from "../../../repositories/group-repository";
import { GroupNotFoundError } from "../../errors/group-not-found";

interface GetGroupByIdRequest {
  id: number;
}

interface GetGroupByIdResponse {
  group: Group;
}

export class GetGroupByIdUseCase {
  constructor(private groupRepository: IGroupRepository) {}

  async execute({ id }: GetGroupByIdRequest): Promise<GetGroupByIdResponse> {
    const group = await this.groupRepository.findById(id);

    if (!group) {
      throw new GroupNotFoundError();
    }

    return {
      group,
    };
  }
}
