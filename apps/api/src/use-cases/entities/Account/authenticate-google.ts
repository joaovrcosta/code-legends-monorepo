import { User } from "@prisma/client";
import { IUsersRepository } from "../../../repositories/users-repository";

interface AuthenticateGoogleRequestDTO {
  email: string;
  name: string;
  avatar?: string | null;
  googleId: string;
}

interface AuthenticateGoogleResponse {
  user: User;
  isNewUser: boolean;
}

export class AuthenticateGoogleUseCase {
  constructor(private userRepository: IUsersRepository) {}

  async execute({
    email,
    name,
    avatar,
    googleId,
  }: AuthenticateGoogleRequestDTO): Promise<AuthenticateGoogleResponse> {
    // Verifica se o usuário já existe
    let user = await this.userRepository.findByEmail(email);

    if (user) {
      // Usuário existe - atualiza dados se necessário e vincula Google
      const updateData: any = { googleId };
      if (!user.avatar && avatar) {
        updateData.avatar = avatar;
      }
      user = await this.userRepository.update(user.id, updateData);
      return { user, isNewUser: false };
    }

    // Usuário não existe - cria novo com Google vinculado
    const newUser = await this.userRepository.create({
      email,
      name,
      password: null, // Sem senha para login Google
      avatar: avatar || null,
      googleId,
    });

    return { user: newUser, isNewUser: true };
  }
}
