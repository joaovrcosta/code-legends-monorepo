import { User } from "@prisma/client";
import { IUsersRepository } from "../../../repositories/users-repository";
import { UserNotFoundError } from "../../errors/user-not-found";

interface UpdateOnboardingRequestDTO {
  userId: string;
  onboardingGoal?: string;
  onboardingCareer?: string;
}

interface UpdateOnboardingResponse {
  user: User;
}

interface OnboardingUpdateData {
  onboardingGoal?: string | null;
  onboardingCareer?: string | null;
}

export class UpdateOnboardingUseCase {
  constructor(private userRepository: IUsersRepository) {}

  async execute({
    userId,
    onboardingGoal,
    onboardingCareer,
  }: UpdateOnboardingRequestDTO): Promise<UpdateOnboardingResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    const updateData: OnboardingUpdateData = {};

    if (onboardingGoal !== undefined) {
      updateData.onboardingGoal = onboardingGoal || null;
    }

    if (onboardingCareer !== undefined) {
      updateData.onboardingCareer = onboardingCareer || null;
    }

    const updatedUser = await this.userRepository.update(
      userId,
      updateData as Partial<User>
    );

    return {
      user: updatedUser,
    };
  }
}
