import { IUsersRepository } from "../../../repositories/users-repository";
import { UserNotFoundError } from "../../errors/user-not-found";
import { InvalidCredentialsError } from "../../errors/invalidCredentials";
import { prisma } from "../../../lib/prisma";

interface UnlinkGoogleRequest {
    userId: string;
}

interface UnlinkGoogleResponse {
    user: {
        id: string;
        email: string;
        googleId: string | null;
        hasPassword: boolean;
    };
}

export class UnlinkGoogleUseCase {
    constructor(private userRepository: IUsersRepository) { }

    async execute({ userId }: UnlinkGoogleRequest): Promise<UnlinkGoogleResponse> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new UserNotFoundError();
        }

        // Verificar se o usuário tem senha antes de desvincular
        // Se não tiver senha, não pode desvincular (precisa criar senha primeiro)
        if (!user.password) {
            throw new InvalidCredentialsError(
                "Você precisa definir uma senha antes de desvincular sua conta Google"
            );
        }

        // Remover o googleId usando Prisma diretamente
        // @ts-ignore - googleId será adicionado após regenerar Prisma Client
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { googleId: null } as any,
        });

        return {
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                googleId: (updatedUser as any).googleId,
                hasPassword: !!updatedUser.password,
            },
        };
    }
}
