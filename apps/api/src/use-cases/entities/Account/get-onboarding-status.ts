import { User } from "@prisma/client";
import { IUsersRepository } from "../../../repositories/users-repository";
import { UserNotFoundError } from "../../errors/user-not-found";

interface GetOnboardingStatusRequestDTO {
  userId: string;
}

interface GetOnboardingStatusResponse {
  onboardingCompleted: boolean;
  onboardingGoal: string | null;
  onboardingCareer: string | null;
}

export class GetOnboardingStatusUseCase {
  constructor(private userRepository: IUsersRepository) {}

  async execute({
    userId,
  }: GetOnboardingStatusRequestDTO): Promise<GetOnboardingStatusResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    return {
      onboardingCompleted: user.onboardingCompleted ?? false,
      onboardingGoal: user.onboardingGoal ?? null,
      onboardingCareer: user.onboardingCareer ?? null,
    };
  }
}

