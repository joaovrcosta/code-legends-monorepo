import { User } from "@prisma/client";
import { IUsersRepository } from "../../../repositories/users-repository";
import { UserNotFoundError } from "../../errors/user-not-found";

interface GetUserProfileRequestDTO {
  userId: string;
}

interface GetUserProfileResponse {
  user: User;
}

export class GetUserProfileUseCase {
  constructor(private userRepository: IUsersRepository) {}

  async execute({
    userId,
  }: GetUserProfileRequestDTO): Promise<GetUserProfileResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    return {
      user,
    };
  }
}
