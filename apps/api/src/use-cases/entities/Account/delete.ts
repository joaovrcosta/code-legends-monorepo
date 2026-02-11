import { IUsersRepository } from "../../../repositories/users-repository";
import { UserNotFoundError } from "../../errors/user-not-found";

interface DeleteUserRequest {
  id: string;
}

export class DeleteUserUseCase {
  constructor(private userRepository: IUsersRepository) {}

  async execute(data: DeleteUserRequest): Promise<void> {
    // Verificar se o usuário existe
    const user = await this.userRepository.findById(data.id);

    if (!user) {
      throw new UserNotFoundError();
    }

    await this.userRepository.delete(data.id);
  }
}



