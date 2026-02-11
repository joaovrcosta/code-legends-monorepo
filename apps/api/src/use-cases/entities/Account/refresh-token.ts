import { User } from "@prisma/client";
import { IUsersRepository } from "../../../repositories/users-repository";
import { UserNotFoundError } from "../../errors/user-not-found";

interface RefreshTokenUseCaseRequest {
  userId: string;
}

interface RefreshTokenUseCaseResponse {
  user: User;
}

export class RefreshTokenUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute({
    userId,
  }: RefreshTokenUseCaseRequest): Promise<RefreshTokenUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    return {
      user,
    };
  }
}

