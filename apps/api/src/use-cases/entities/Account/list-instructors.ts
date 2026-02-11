import { User, Role } from "@prisma/client";
import { IUsersRepository } from "../../../repositories/users-repository";

interface ListInstructorsResponse {
  instructors: (User & { Address?: any })[];
}

export class ListInstructorsUseCase {
  constructor(private userRepository: IUsersRepository) {}

  async execute(): Promise<ListInstructorsResponse> {
    // Buscar tanto INSTRUCTOR quanto ADMIN
    const instructors = await this.userRepository.findByRoles([
      Role.INSTRUCTOR,
      Role.ADMIN,
    ]);

    return {
      instructors,
    };
  }
}
