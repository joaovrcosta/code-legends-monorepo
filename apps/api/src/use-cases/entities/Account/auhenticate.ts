import { User } from "@prisma/client";
import { IUsersRepository } from "../../../repositories/users-repository";
import { compare } from "bcryptjs";
import { InvalidCredentialsError } from "../../errors/invalidCredentials";

interface AuthenticateUserRequestDTO {
  email: string;
  password: string;
}

interface AuthenticateUserResponse {
  user: User;
}

export class AuthenticateUserUseCase {
  constructor(private userRepository: IUsersRepository) {}

  async execute({
    email,
    password,
  }: AuthenticateUserRequestDTO): Promise<AuthenticateUserResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const doesPasswordMatch = await compare(password, user.password);

    if (!doesPasswordMatch) {
      throw new InvalidCredentialsError();
    }

    return {
      user,
    };
  }
}
