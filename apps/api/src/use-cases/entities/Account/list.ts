import { User } from "@prisma/client";
import { IUsersRepository } from "../../../repositories/users-repository";

interface ListUsersResponse {
  users: (User & { Address?: any })[];
}

export class ListUsersUseCase {
  constructor(private userRepository: IUsersRepository) {}

  async execute(): Promise<ListUsersResponse> {
    const users = await this.userRepository.findAll();

    return {
      users,
    };
  }
}

