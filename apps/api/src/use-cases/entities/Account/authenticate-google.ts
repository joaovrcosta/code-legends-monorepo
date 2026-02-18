import { User } from "@prisma/client";
import { IUsersRepository } from "../../../repositories/users-repository";

interface AuthenticateGoogleRequestDTO {
  email: string;
  name: string;
  avatar?: string | null;
  googleId: string;
  canAssociateProvider?: boolean;
}

interface AuthenticateGoogleResponse {
  user: User;
  isNewUser: boolean;
}

export class AuthenticateGoogleUseCase {
  constructor(private userRepository: IUsersRepository) { }

  async execute({
    email,
    name,
    avatar,
    googleId,
    canAssociateProvider = true,
  }: AuthenticateGoogleRequestDTO): Promise<AuthenticateGoogleResponse> {
    // Verifica se o usuário já existe
    let user = await this.userRepository.findByEmail(email);

    if (user) {
      const updateData: any = {
        googleId,
        lastLogin: new Date(),
      };
      if (!user.avatar && avatar) {
        updateData.avatar = avatar;
      }
      user = await this.userRepository.update(user.id, updateData);
      return { user, isNewUser: false };
    }

    if (!canAssociateProvider) {
      throw new Error("USER_NOT_FOUND");
    }

    const newUser = await this.userRepository.create({
      email,
      name,
      password: null,
      avatar: avatar || null,
      googleId,
    });

    return { user: newUser, isNewUser: true };
  }
}
