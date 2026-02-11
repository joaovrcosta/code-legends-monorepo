import { User } from "@prisma/client";
import { IUsersRepository } from "../../../repositories/users-repository";

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  avatar?: string | null;
}

export class CreateUserUseCase {
  constructor(private userRepository: IUsersRepository) {}

  async execute(data: CreateUserRequest): Promise<User> {
    const userWithSameEmail = await this.userRepository.findByEmail(data.email);

    if (userWithSameEmail) {
      throw new Error("User already exists");
    }

    const user = await this.userRepository.create(data);

    return user;
  }
}
