import { User } from "@prisma/client";
import { IUsersRepository } from "../../../repositories/users-repository";
import { UserNotFoundError } from "../../errors/user-not-found";

interface CompleteOnboardingRequestDTO {
  userId: string;
}

interface CompleteOnboardingResponse {
  user: User;
}

export class CompleteOnboardingUseCase {
  constructor(private userRepository: IUsersRepository) {}

  async execute({
    userId,
  }: CompleteOnboardingRequestDTO): Promise<CompleteOnboardingResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    const updatedUser = await this.userRepository.update(userId, {
      onboardingCompleted: true,
    });

    return {
      user: updatedUser,
    };
  }
}

