import { User } from "@prisma/client";
import { IUsersRepository } from "../../../repositories/users-repository";
import { UserNotFoundError } from "../../errors/user-not-found";

interface GetUserByIdRequest {
  id: string;
}

interface GetUserByIdResponse {
  user: User & { Address?: any };
}

export class GetUserByIdUseCase {
  constructor(private userRepository: IUsersRepository) {}

  async execute({ id }: GetUserByIdRequest): Promise<GetUserByIdResponse> {
    const user = await this.userRepository.findByIdWithAddress(id);

    if (!user) {
      throw new UserNotFoundError();
    }

    return {
      user,
    };
  }
}



